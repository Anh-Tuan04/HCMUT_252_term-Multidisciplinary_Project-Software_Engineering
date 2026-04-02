import slotService from '../services/parkingslot.service.js';

class SlotController {
    // (POST /api/slots/sensor)
    async updateFromSensor(req, res) {
        try {
            const { device_mac, port, isOccupied } = req.body;
            const result = await slotService.handleSensorUpdate(device_mac, port, isOccupied);

            if (result.error) return res.status(result.code).json({ success: false, message: result.error });

            if (result.changed) {
                if (result.changed) {
                const roomName = `lot_${result.lot_id}`;
                req.io.to(roomName).emit('SLOT_UPDATE', {
                    id: result.id,
                    lot_id: result.lot_id,
                    oldStatus: result.oldStatus,
                    newStatus: result.newStatus,
                    name: result.name
                });
            }
            }

            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateFromAdmin(req, res) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: "Thiếu id" });

            const { status } = req.body;
            const result = await slotService.handleAdminUpdate(id, status);
            if (result.error) return res.status(result.code).json({ success: false, message: result.error });

            if (result.changed) {
                const roomName = `lot_${result.lot_id}`;
                req.io.to(roomName).emit('SLOT_UPDATE', {
                    id: result.id,
                    lot_id: result.lot_id,
                    oldStatus: result.oldStatus,
                    newStatus: result.newStatus,
                    name: result.name
                });
            }

            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // API Dashboard (GET /api/slots?lotId=1)
    async getByLot(req, res) {
        try {
            const { lotId } = req.query;
            if (!lotId) return res.status(400).json({ message: "Thiếu lotId" });

            const data = await slotService.getLotDashboard(lotId);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
export default new SlotController();