const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;
const socketOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean)
  : ["*"];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: socketOrigins.includes("*") ? "*" : socketOrigins,
    credentials: true
  }
});

global.io = io;

io.on("connection", socket => {
  logger.info("SOC dashboard client connected", { socketId: socket.id });
  socket.on("disconnect", () => {
    logger.info("SOC dashboard client disconnected", { socketId: socket.id });
  });
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info("SOC Server running with real-time alerts", { port: PORT });
    });

    // Start real-world auto-incident correlation job
    const startAutoIncidentJob = require("./jobs/autoIncident");
    startAutoIncidentJob();
  })
  .catch(err => {
    logger.error("MongoDB connection failed", err);
    process.exit(1);
  });

const shutdown = (signal) => {
  logger.warn("Shutting down server", { signal });
  server.close(() => {
    require("mongoose").connection.close(false).then(() => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
