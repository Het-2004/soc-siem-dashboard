const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const logger = require("./utils/logger");

dotenv.config();

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
  logger.info("SOC dashboard connected", { socketId: socket.id });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      logger.info("SOC Server running with real-time alerts", { port: PORT });
    });
  })
  .catch(err => {
    logger.error("MongoDB connection failed", err);
  });

const shutdown = (signal) => {
  logger.warn("Shutting down server", { signal });
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
