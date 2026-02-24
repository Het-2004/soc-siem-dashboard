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

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: "Route not found"
	});
});

// Global error handler (must be last)
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

module.exports = app;
