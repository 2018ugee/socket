const dotenv = require("dotenv");
// const PORT = process.env.PORT || 5000;
// const INDEX = '/index.js'

dotenv.config();

const io = require("socket.io")(process.env.PORT || 5000, {
  cors: {
    origins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://pandsocials.herokuapp.com",
      "https://pandsocial.netlify.app",
    ],
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //on connection
  console.log("a user connected");
  // io.emit("welcome","Hello your connected to socket.io");

  //take userId & socketId from client site
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id); //socket id is id of client socket from where event is emitted.
    io.emit("getUsers", users); //emit curr users to everyone and we can filter it to show online friends.
  });

  //send & get messages
  socket.on("sendMessage", ({ senderId, recieverId, text }) => {
    const user = getUser(recieverId);
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  //on disconnection
  socket.on("disconnect", () => {
    console.log("user disconnect");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
