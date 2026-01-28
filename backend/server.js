// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const app = require("./app");

// dotenv.config();

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(5000, () => {
//       console.log("Server running on port 5000");
//     });
//   })
//   .catch(err => console.log(err));

const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

global.io = io;

io.on("connection", socket => {
  console.log("SOC dashboard connected");
});

server.listen(5000, () => {
  console.log("SOC Server running with real-time alerts");
});
