import express from 'express';
import slotController from '../controllers/parkingslot.controller.js';

const router = express.Router();

// API Dashboard (GET /api/slots?lotId=1)
router.get('/', slotController.getByLot);

// Xử lý cập nhật từ Sensor (POST /api/slots/sensor)
router.post('/sensor', slotController.updateFromSensor);

export default router;