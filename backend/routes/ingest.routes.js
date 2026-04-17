/**
 * /api/ingest — Public API for real-world data ingestion
 *
 * Allows external systems (firewalls, IDS/IPS, SIEM agents, network
 * monitoring tools, custom scripts) to push security events directly
 * into this SOC dashboard with no UI needed.
 *
 * Authentication: API Key via  X-API-Key  header  OR  ?apiKey=  query param.
 * Set  INGEST_API_KEY  in your .env to enable. Leave blank to disable.
 *
 * ── Endpoints ──────────────────────────────────────────────────────
 *
 *  POST /api/ingest/alert
 *    Body: { title, severity, ipAddress, [status] }
 *    → Creates an Alert + GeoIP lookup + Socket.IO "new-alert" event
 *    → If severity=HIGH sends email alert (if SMTP configured)
 *
 *  POST /api/ingest/log
 *    Body: { type, message, ipAddress, [severity], [endpoint] }
 *    → Creates a Log entry
 *
 *  POST /api/ingest/bulk
 *    Body: { alerts: [...], logs: [...] }
 *    → Batch insert up to 100 alerts + 100 logs per call
 *
 *  GET /api/ingest/health
 *    → Quick liveness check (no auth needed)
 */

const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const Log = require("../models/Log");
const { sendHighAlert } = require("../utils/mailer");

// GeoIP — resolves public IPs to lat/lng/country/city
let geo;
try {
  geo = require("geoip-lite");
} catch (_) {
  console.warn("[Ingest] geoip-lite not installed — GeoIP lookup disabled.");
}

/* ── API-Key auth middleware ──────────────────────────────── */
const apiKeyAuth = (req, res, next) => {
  const envKey = process.env.INGEST_API_KEY;

  /* If no key is configured → ingest is disabled */
  if (!envKey || envKey.trim() === "") {
    return res.status(503).json({
      success: false,
      error: "Ingest endpoint is disabled. Set INGEST_API_KEY in .env to enable."
    });
  }

  const provided =
    req.headers["x-api-key"] ||
    req.query.apiKey;

  if (!provided || provided !== envKey) {
    return res.status(401).json({ success: false, error: "Invalid or missing API key." });
  }

  next();
};

/* ── Helpers ──────────────────────────────────────────────── */
const VALID_SEVERITIES = ["HIGH", "MEDIUM", "LOW"];
const VALID_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

const normSeverity = (s) =>
  VALID_SEVERITIES.includes((s || "").toUpperCase()) ? s.toUpperCase() : "LOW";

const normStatus = (s) =>
  VALID_STATUSES.includes((s || "").toUpperCase()) ? s.toUpperCase() : "OPEN";

/**
 * Lookup GeoIP data for an IP address.
 * Returns { lat, lng, country, city } or all nulls for private/unknown IPs.
 */
const lookupGeo = (ip) => {
  if (!geo || !ip) return { lat: null, lng: null, country: null, city: null };
  // Skip private IP ranges — geoip-lite returns null for these
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1|localhost)/.test(ip)) {
    return { lat: null, lng: null, country: "Private", city: "LAN" };
  }
  const result = geo.lookup(ip);
  if (!result) return { lat: null, lng: null, country: null, city: null };
  const [lat, lng] = result.ll || [null, null];
  return {
    lat,
    lng,
    country: result.country || null,
    city: result.city || null,
  };
};

/* Emit Socket.IO new-alert if io is available */
const emitAlert = (alert) => {
  try {
    if (global.io) {
      global.io.emit("new-alert", {
        title: alert.title,
        severity: alert.severity,
        ip: alert.ipAddress,
        status: alert.status,
        lat: alert.lat,
        lng: alert.lng,
        country: alert.country,
        city: alert.city,
      });
    }
  } catch (_) { /* ignore */ }
};

/* ── Health check (no auth) ───────────────────────────────── */
router.get("/health", (_req, res) => {
  const enabled = !!(process.env.INGEST_API_KEY && process.env.INGEST_API_KEY.trim());
  const geoEnabled = !!geo;
  const emailEnabled = !!(process.env.SMTP_USER && process.env.ALERT_EMAIL);
  res.json({
    status: "ok",
    ingest: enabled ? "enabled" : "disabled",
    geoip: geoEnabled ? "enabled" : "disabled",
    emailAlerts: emailEnabled ? "enabled" : "disabled",
  });
});

/* ── GET /api/ingest (route guide) ───────────────────────── */
router.get("/", (_req, res) => {
  return res.json({
    success: true,
    message: "Ingest API is reachable",
    endpoints: {
      health: "GET /api/ingest/health",
      ingest: "POST /api/ingest",
      alert: "POST /api/ingest/alert",
      log: "POST /api/ingest/log",
      bulk: "POST /api/ingest/bulk",
    },
    auth: "Use x-api-key header or ?apiKey=...",
  });
});

/* ── POST /api/ingest (compatibility root endpoint) ───────── */
router.post("/", apiKeyAuth, async (req, res) => {
  try {
    const {
      title,
      type,
      message,
      ipAddress,
      severity,
      status,
      endpoint,
    } = req.body;

    if (!ipAddress) {
      return res.status(400).json({
        success: false,
        error: "Required field: ipAddress",
      });
    }

    // If title is present, treat as alert payload
    if (title) {
      const geoData = lookupGeo(String(ipAddress));
      const finalSeverity = normSeverity(severity);

      const alert = await Alert.create({
        title: String(title).slice(0, 300),
        severity: finalSeverity,
        ipAddress: String(ipAddress).slice(0, 64),
        status: normStatus(status),
        ...geoData,
      });

      emitAlert(alert);
      if (finalSeverity === "HIGH") {
        sendHighAlert(alert);
      }

      return res.status(201).json({
        success: true,
        mode: "alert",
        id: alert._id,
        geo: geoData,
      });
    }

    // Otherwise require message and treat as log payload
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Required fields: message, ipAddress (or send title, ipAddress for alert mode)",
      });
    }

    const log = await Log.create({
      type: String(type || "EXTERNAL").toUpperCase().slice(0, 32),
      message: String(message).slice(0, 1000),
      ipAddress: String(ipAddress).slice(0, 64),
      severity: normSeverity(severity),
      endpoint: endpoint ? String(endpoint).slice(0, 256) : undefined,
    });

    return res.status(201).json({
      success: true,
      mode: "log",
      id: log._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ── POST /api/ingest/alert ───────────────────────────────── */
router.post("/alert", apiKeyAuth, async (req, res) => {
  try {
    const { title, severity, ipAddress, status } = req.body;

    if (!title || !ipAddress) {
      return res.status(400).json({
        success: false,
        error: "Required fields: title, ipAddress"
      });
    }

    const geoData = lookupGeo(String(ipAddress));
    const finalSeverity = normSeverity(severity);

    const alert = await Alert.create({
      title: String(title).slice(0, 300),
      severity: finalSeverity,
      ipAddress: String(ipAddress).slice(0, 64),
      status: normStatus(status),
      ...geoData,
    });

    // Emit real-time websocket event
    emitAlert(alert);

    // Send email for HIGH severity (non-blocking)
    if (finalSeverity === "HIGH") {
      sendHighAlert(alert); // intentionally not awaited
    }

    return res.status(201).json({ success: true, id: alert._id, geo: geoData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ── POST /api/ingest/log ─────────────────────────────────── */
router.post("/log", apiKeyAuth, async (req, res) => {
  try {
    const { type, message, ipAddress, severity, endpoint } = req.body;

    if (!message || !ipAddress) {
      return res.status(400).json({
        success: false,
        error: "Required fields: message, ipAddress"
      });
    }

    const log = await Log.create({
      type: String(type || "EXTERNAL").toUpperCase().slice(0, 32),
      message: String(message).slice(0, 1000),
      ipAddress: String(ipAddress).slice(0, 64),
      severity: normSeverity(severity),
      endpoint: endpoint ? String(endpoint).slice(0, 256) : undefined,
    });

    return res.status(201).json({ success: true, id: log._id });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ── POST /api/ingest/bulk ────────────────────────────────── */
router.post("/bulk", apiKeyAuth, async (req, res) => {
  try {
    const { alerts = [], logs = [] } = req.body;

    if (!Array.isArray(alerts) || !Array.isArray(logs)) {
      return res.status(400).json({ success: false, error: "alerts and logs must be arrays" });
    }

    const MAX = 100;
    const alertSlice = alerts.slice(0, MAX);
    const logSlice = logs.slice(0, MAX);

    const alertDocs = alertSlice
      .filter(a => a.title && a.ipAddress)
      .map(a => {
        const geoData = lookupGeo(String(a.ipAddress));
        return {
          title: String(a.title).slice(0, 300),
          severity: normSeverity(a.severity),
          ipAddress: String(a.ipAddress).slice(0, 64),
          status: normStatus(a.status),
          ...geoData,
        };
      });

    const logDocs = logSlice
      .filter(l => l.message && l.ipAddress)
      .map(l => ({
        type: String(l.type || "EXTERNAL").toUpperCase().slice(0, 32),
        message: String(l.message).slice(0, 1000),
        ipAddress: String(l.ipAddress).slice(0, 64),
        severity: normSeverity(l.severity),
        endpoint: l.endpoint ? String(l.endpoint).slice(0, 256) : undefined,
      }));

    const [insertedAlerts, insertedLogs] = await Promise.all([
      alertDocs.length ? Alert.insertMany(alertDocs, { ordered: false }) : Promise.resolve([]),
      logDocs.length ? Log.insertMany(logDocs, { ordered: false }) : Promise.resolve([]),
    ]);

    /* Emit each new alert + email HIGH ones */
    insertedAlerts.forEach(alert => {
      emitAlert(alert);
      if (alert.severity === "HIGH") sendHighAlert(alert);
    });

    return res.status(201).json({
      success: true,
      alertsInserted: insertedAlerts.length,
      logsInserted: insertedLogs.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
