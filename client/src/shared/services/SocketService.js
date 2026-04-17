// src/shared/services/SocketService.js
import { io } from "socket.io-client";

let socket = null;
let socketAuthToken = '';

const SOCKET_URL = (
    import.meta.env.VITE_SOCKET_URL
    || import.meta.env.VITE_SERVER_URL
    || "http://localhost:8080"
).replace(/\/+$/, '');

const SocketService = {
    connect: (accessToken) => {
        const safeToken = String(accessToken ?? '').trim();

        if (!safeToken) {
            throw new Error('Missing access token for socket connection');
        }

        const shouldReconnect = !socket || socketAuthToken !== safeToken;

        if (shouldReconnect) {
            if (socket) {
                socket.disconnect();
            }

            socketAuthToken = safeToken;
            socket = io(`${SOCKET_URL}/parking`, {
                auth: {
                    token: `Bearer ${safeToken}`
                },
                transports: ['websocket', 'polling']
            });
        }

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }

        socketAuthToken = '';
    }
};

export default SocketService;