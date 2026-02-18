const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// health check
const healthRoutes = require("./routes/health.routes");
app.use("/health", healthRoutes);

const auditLogger = require("./middlewares/auditLogger");
app.use(auditLogger);
app.use("/api/audit-logs", require("./routes/audit.routes"));
app.use("/api/stats", require("./routes/stats.routes"));
app.use("/api/trends", require("./routes/trend.routes"));

module.exports = app;
