import { io } from "socket.io-client";

// Replace with your backend port
const SOCKET_URL = "http://localhost:5001"; 

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    query: {
        userId: localStorage.getItem("userId") || "" // send userId when connecting
    }
});
