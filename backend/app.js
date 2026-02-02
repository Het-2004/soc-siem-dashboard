const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// health check
const healthRoutes = require("./routes/health.routes");
app.use("/health", healthRoutes);

module.exports = app;
