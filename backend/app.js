const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Security headers
const securityHeaders = require("./middlewares/securityHeaders");
app.use(securityHeaders);

// Rate limiting middleware
const rateLimiter = require("./middlewares/rateLimiter");
app.use(rateLimiter);

// health check
const healthRoutes = require("./routes/health.routes");
app.use("/health", healthRoutes);

// auth routes (must be before auditLogger)
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// alert routes
const alertRoutes = require("./routes/alert.routes");
app.use("/api/alerts", alertRoutes);

// incident routes
const incidentRoutes = require("./routes/incident.routes");
app.use("/api/incidents", incidentRoutes);

// log routes
const logRoutes = require("./routes/log.routes");
app.use("/api/logs", logRoutes);

// stats and trends routes
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/trends", require("./routes/trend.routes"));

// audit routes
app.use("/api/audit-logs", require("./routes/audit.routes"));

// IP blocker middleware (applies to everything after)
const ipBlocker = require("./middlewares/ipBlocker");
app.use(ipBlocker);

// Global error handler (must be last)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
