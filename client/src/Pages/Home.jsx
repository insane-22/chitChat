import React, { useState } from "react";
import "../styles/Home.css";
import { v4 as uuidv4, validate } from "uuid";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Username is required",
        timer: 3000,
        timerProgressBar: true,
      });
    } else {
      const id = uuidv4();
      setRoomId(id);
      setUsername(username);

      Swal.fire({
        position: "top",
        icon: "success",
        title: "New room created successfully!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setTimeout(() => {
        navigate(`/${id}`, {
          state: {
            username: username,
          },
        });
      }, 2000);
    }
  };

  const joinRoom = () => {
    if (!roomId|| !username) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Room ID and Username are required",
        timer: 3000,
        timerProgressBar: true,
      });
    } else if (!validate(roomId)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Room ID is incorrect",
        timer: 3000,
        timerProgressBar: true,
      });
    } else {

      navigate(`/${roomId}`, {
        state: {
          username: username,
        },
      });
    }
  };

  return (
    <div className="container1">
      <div className="sub-main">
        <h1 className="heading">chitChat :)</h1>
        <div>
          <input
            type="text"
            placeholder="Enter Username"
            className="name"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <input
            type="text"
            placeholder="Enter Room ID to join a room"
            className="roomId"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
          />
        </div>
        <div className="login-button">
          <button className="create-room bn" onClick={joinRoom}>
            Join Room
          </button>
          <button className="join-room bn" onClick={createRoom}>
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
