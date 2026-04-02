'use strict';
import express from 'express';
import 'dotenv/config';
import {getConnection} from './config/db.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import slotRoutes from './routes/parkingslot.route.js';

const app = express();
const httpServer = createServer(app); // Tạo server HTTP từ app express
const PORT = +process.env.PORT || 3000;

// Khởi tạo Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',').map(s => s.trim()),
    methods: ["GET", "POST", "PATCH"]
  }
});

// Middleware để truyền 'io' vào từng Request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Static files
app.use(express.static('public'));

// Config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const origins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim());
app.use(cors({
  origin: origins,
  credentials: true,
}));

const startServer = async () => {
  try {
    await getConnection();

    app.use('/api/slots', slotRoutes);

    // Xử lý Socket.io với Room
    io.on('connection', (socket) => {
      console.log('Thiết bị kết nối:', socket.id);

      // Khi Web Dashboard gửi yêu cầu vào xem một bãi xe cụ thể
      // VD Đang ở bãi đỗ xe 1 thì mới nhận socket update của bãi 1, không nhận update của bãi 2
      socket.on('join_lot', (lotId) => {
        const roomName = `lot_${lotId}`;

        // Rời bỏ các phòng cũ trước đó (nếu có) để tránh nhận tin chồng chéo
        Array.from(socket.rooms).forEach(room => {
          if (room !== socket.id) socket.leave(room);
        });

        socket.join(roomName);
        console.log(`User ${socket.id} đã vào phòng: ${roomName}`);
      });

      socket.on('disconnect', () => {
        console.log('Thiết bị ngắt kết nối.');
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();