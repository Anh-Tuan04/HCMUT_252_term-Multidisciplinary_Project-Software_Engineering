// src/shared/services/SocketService.js
import { io } from "socket.io-client";

let socket = null;

const SocketService = {
    connect: () => {
        if (!socket) {
            socket = io("http://localhost:3000");
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