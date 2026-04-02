// src/shared/services/SocketService.js
import { io } from "socket.io-client";

let socket = null;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const SocketService = {
    connect: () => {
        if (!socket) {
            socket = io(SOCKET_URL);
            console.log("Connected to Parking Server");
        }
        return socket;
    },
    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }
};

export default SocketService;