const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors:{
    origin:"*",
    methods:["GET","POST"]
  }
});

app.get('/', (req, res) => {
  res.send("hello from socket server")
});



server.listen(8080, () => {
  console.log('listening on *:8080');
});

let users = [];

const addUsers = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUsers = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};


io.on("connection", (socket) => {
  console.log("User Connected");

      socket.on("disconnect", () => {
        removeUsers(socket.id);
        console.log("User Disconnected");
        io.emit("getUsers", users);
});

socket.on("addUser", (userId) => {
        addUsers(userId, socket.id);
        io.emit("getUsers", users);
      });

      socket.emit("getUsers", users);

      socket.on("sendMessage", ({ senderId, receiverId, text }) => {
  const receiver = getUser(receiverId);
        if (!receiver) return;
        socket.to(receiver.socketId).emit("getMessage", {
          senderId,
          text,
        });
      });

      console.log(users);
});
