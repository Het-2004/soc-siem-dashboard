const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const logger = require("./utils/logger");

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

io.on("connection", socket => {
  logger.info("SOC dashboard connected", { socketId: socket.id });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => {
      logger.info("SOC Server running with real-time alerts on port 5000");
    });
  })
  .catch(err => {
    logger.error("MongoDB connection failed", err);
  });
