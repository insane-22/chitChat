import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

let socket;

const initialState = {
  clients: [],
  messages: [],
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    updateClientsList(state, action) {
      state.clients = action.payload;
    },
    clearClientsList(state) {
      state.clients = [];
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const initializeSocket = (username, roomId) => (dispatch) => {
  socket = io("http://localhost:3001");

  socket.emit("joinRoom", { username, roomId });

  socket.on("updating-client-list", ({ users, newUser }) => {
    dispatch(socketSlice.actions.updateClientsList(users));
  });

  socket.on("message", (message) => {
    dispatch(socketSlice.actions.addMessage(message));
  });

  socket.on("member left", ({ username }) => {
    console.log(`${username} left the room`);
  });
};

export const sendMessage = (roomId, message) => (dispatch) => {
  if (socket) {
    socket.emit("sendMessage", { roomId, message });
  }
};

export const disconnectSocket =
  ({ roomId }) =>
  (dispatch) => {
    if (socket) {
      socket.emit("leave room", { roomId });
      socket.disconnect();
      socket = null;
    }
    dispatch(socketSlice.actions.clearClientsList());
  };

export const {
  updateClientsList,
  clearClientsList,
  addMessage,
  clearMessages,
} = socketSlice.actions;

export const selectClients = (state) => state.socket.clients;
export const selectMessages = (state) => state.socket.messages;

export default socketSlice.reducer;
