import React, { useEffect, useRef, useState } from "react";
import "../styles/Room.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import Client from "../components/Client";
import {
  initializeSocket,
  disconnectSocket,
  selectClients,
  sendMessage, // Import the sendMessage action
  selectMessages,
} from "../redux/socketSlice";

const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const clients = useSelector(selectClients);
  const messages = useSelector(selectMessages);

  const username = location.state?.username;
  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef(null);  

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!username) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Username is required",
        timer: 3000,
        timerProgressBar: true,
      });
      navigate("/", { replace: true });
      return;
    }

    dispatch(initializeSocket(username, roomId));

    return () => {
      dispatch(disconnectSocket(roomId));
    };
  }, [dispatch, username, roomId, navigate]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      dispatch(sendMessage(roomId, messageText)); 
      setMessageText(""); 
    }
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      Swal.fire({
        position: "top",
        title: "RoomID copied to Clipboard",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire({
        text: "Unable to copy Room ID",
        timer: 3000,
        timerProgressBar: true,
      });
      console.log(error);
    }
  };

  const leaveRoom = () => {
    navigate("/", {
      replace: true,
      state: {},
    });
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <h1>chitChat</h1>
          </div>
          <h2>Connected</h2>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="chatWrap">
        <div className="messagesList">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.user === username ? "ownMessage" : "otherMessage"
              }`}
            >
              <strong>{message.user === username ? "You" : message.user}:</strong>{" "}
              {message.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="messageInputWrap">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="messageInput"
          />
          <button onClick={handleSendMessage} className="sendBtn">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
