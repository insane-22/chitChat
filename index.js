const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const userSocketMap = {};
const rooms = {};

async function getUsersInRoom(roomId) {
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (socketsInRoom) {
    return Array.from(socketsInRoom).map((socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    }));
  }
  return [];
}

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });

  socket.on("joinRoom", async (data) => {
    const { roomId, username } = data;
    console.log("username: ", username);

    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const users = await getUsersInRoom(roomId);
    users.forEach(({ socketId }) => {
      io.to(socketId).emit("updating-client-list", {
        users,
        newUser: username,
        socketId: socket.id,
      });
    });
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    const username = userSocketMap[socket.id];
    io.to(roomId).emit("message", { user: username, text: message });
  });

  socket.on("disconnecting", async () => {
    console.log("User disconnected: ", socket.id);
    const username = userSocketMap[socket.id];
    delete userSocketMap[socket.id];

    // for (const roomId of socket.rooms) {
    //   if (rooms[roomId]) {
    //     const users = await getUsersInRoom(roomId);

    //     users.forEach(({ socketId }) => {
    //       io.to(socketId).emit("updating-client-list", {
    //         users,
    //         newUser: username,
    //         socketId: socket.id,
    //       });
    //     });

    //   }
    // }
  });

  socket.on("leave room", async ({ roomId }) => {
    const username = userSocketMap[socket.id];
    console.log(`${username} left the room`);
    socket.leave(roomId);
  
    socket.in(roomId).emit("member left", {
      username: userSocketMap[socket.id],
    });
  
    delete userSocketMap[socket.id];
  
    const users = await getUsersInRoom(roomId);
    io.to(roomId).emit("updating-client-list", {
      users, 
      newUser: null,
    });
  });
  
  socket.on("disconnecting", async () => {
    const username = userSocketMap[socket.id];
    delete userSocketMap[socket.id];
  
    for (const roomId of socket.rooms) {
      const users = await getUsersInRoom(roomId);
      io.to(roomId).emit("updating-client-list", {
        users,
        newUser: null,
      });
    }
  });
  
});

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Welcome to chitChat",
  });
});

const port = process.env.PORT;
server.listen(port, () => {
  console.log("server listening on port ", port);
});
