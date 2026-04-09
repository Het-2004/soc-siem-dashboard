const express = require("express");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean)
  : ["*"];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: false, limit: process.env.JSON_LIMIT || "1mb" }));
app.use(cors(corsOptions));

// Security headers
const securityHeaders = require("./middlewares/securityHeaders");
app.use(securityHeaders);

// Rate limiting — skip for auth routes (login / register get their own generous limit)
const rateLimiter = require("./middlewares/rateLimiter");
app.use((req, res, next) => {
  if (req.path.startsWith("/api/auth")) return next();
  return rateLimiter(req, res, next);
});

// IP blocker — placed before routes so it can gate all requests
const ipBlocker = require("./middlewares/ipBlocker");
app.use(ipBlocker);

// Health check (public)
const healthRoutes = require("./routes/health.routes");
app.use("/health", healthRoutes);

// Auth routes (public — register / login)
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Audit logger — logs every authenticated request (checks req.user internally)
const auditLogger = require("./middlewares/auditLogger");
app.use(auditLogger);

// Protected API routes
app.use("/api/alerts", require("./routes/alert.routes"));
app.use("/api/incidents", require("./routes/incident.routes"));
app.use("/api/logs", require("./routes/log.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/trends", require("./routes/trend.routes"));
app.use("/api/audit-logs", require("./routes/audit.routes"));
app.use("/api/ingest", require("./routes/ingest.routes")); // Real-world data ingestion

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler (must be last)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
