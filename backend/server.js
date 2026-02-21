const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

io.on("connection", socket => {
  console.log("SOC dashboard connected");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(5000, () => {
      console.log("SOC Server running with real-time alerts on port 5000");
    });
  })
  .catch(err => console.log(err));
