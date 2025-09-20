import { io } from "socket.io-client";

// Replace with your backend port
const SOCKET_URL = import.meta.env.VITE_BASE_URL; 

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    query: {
        userId: localStorage.getItem("userId") || "" // send userId when connecting
    }
});
