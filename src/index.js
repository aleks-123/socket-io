const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 8000;

const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);

    console.log(username, room);
    socket.emit("message", generateMessage("Welcome")); // siprakjame na site
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`)); // samo na roomot osven na isprakjachot
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Bad words are not allowed");
    }
    io.to("test").emit("message", generateMessage(message));
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback("Location shared!");
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
