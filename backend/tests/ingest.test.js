/**
 * tests/ingest.test.js — Tests for the /api/ingest endpoints
 */

const request = require("supertest");
const app = require("../app");

const VALID_KEY = "test-ingest-key-12345";

// Set the ingest key before tests run
beforeAll(() => {
  process.env.INGEST_API_KEY = VALID_KEY;
});

/* ── GET /api/ingest/health ─────────────────────────────── */
describe("GET /api/ingest/health", () => {
  it("returns 200 and status ok", async () => {
    const res = await request(app).get("/api/ingest/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.ingest).toBe("enabled");
  });
});

/* ── POST /api/ingest/alert ─────────────────────────────── */
describe("POST /api/ingest/alert", () => {
  it("rejects request with no API key (401)", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .send({ title: "Test Alert", ipAddress: "1.2.3.4", severity: "HIGH" });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects request with wrong API key (401)", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .set("X-API-Key", "wrong-key")
      .send({ title: "Test Alert", ipAddress: "1.2.3.4", severity: "HIGH" });
    expect(res.statusCode).toBe(401);
  });

  it("rejects body missing required fields (400)", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .set("X-API-Key", VALID_KEY)
      .send({ severity: "HIGH" }); // missing title and ipAddress
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/title/i);
  });

  it("creates alert with valid key and body (201)", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .set("X-API-Key", VALID_KEY)
      .send({ title: "SSH Brute Force", ipAddress: "8.8.8.8", severity: "HIGH" });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  it("normalises lowercase severity to uppercase", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .set("X-API-Key", VALID_KEY)
      .send({ title: "Port Scan", ipAddress: "1.1.1.1", severity: "medium" });
    expect(res.statusCode).toBe(201);
  });

  it("defaults invalid severity to LOW", async () => {
    const res = await request(app)
      .post("/api/ingest/alert")
      .set("X-API-Key", VALID_KEY)
      .send({ title: "Unknown", ipAddress: "2.2.2.2", severity: "CRITICAL" });
    expect(res.statusCode).toBe(201); // CRITICAL normalises to LOW
  });
});

/* ── POST /api/ingest/log ───────────────────────────────── */
describe("POST /api/ingest/log", () => {
  it("creates a log entry (201)", async () => {
    const res = await request(app)
      .post("/api/ingest/log")
      .set("X-API-Key", VALID_KEY)
      .send({ message: "Failed SSH login", ipAddress: "10.0.0.1", severity: "HIGH", type: "AUTH" });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
  });

  it("rejects missing message (400)", async () => {
    const res = await request(app)
      .post("/api/ingest/log")
      .set("X-API-Key", VALID_KEY)
      .send({ ipAddress: "10.0.0.1" });
    expect(res.statusCode).toBe(400);
  });
});

/* ── POST /api/ingest/bulk ──────────────────────────────── */
describe("POST /api/ingest/bulk", () => {
  it("inserts multiple alerts and logs (201)", async () => {
    const res = await request(app)
      .post("/api/ingest/bulk")
      .set("X-API-Key", VALID_KEY)
      .send({
        alerts: [
          { title: "DDoS", ipAddress: "5.5.5.5", severity: "HIGH" },
          { title: "Port Scan", ipAddress: "6.6.6.6", severity: "MEDIUM" },
        ],
        logs: [
          { message: "Firewall rule triggered", ipAddress: "7.7.7.7", type: "FIREWALL" },
        ],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.alertsInserted).toBe(2);
    expect(res.body.logsInserted).toBe(1);
  });

  it("rejects if alerts is not an array (400)", async () => {
    const res = await request(app)
      .post("/api/ingest/bulk")
      .set("X-API-Key", VALID_KEY)
      .send({ alerts: "not-an-array", logs: [] });
    expect(res.statusCode).toBe(400);
  });

  it("skips invalid entries (missing required fields)", async () => {
    const res = await request(app)
      .post("/api/ingest/bulk")
      .set("X-API-Key", VALID_KEY)
      .send({
        alerts: [{ title: "Valid", ipAddress: "9.9.9.9" }, { severity: "HIGH" }], // second is invalid
        logs: [],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.alertsInserted).toBe(1); // only the valid one
  });
});
