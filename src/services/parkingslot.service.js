import slotRepository from '../repositories/parkingslot.repository.js';

class SlotService {
    // Xử lý từ Sensor
    async handleSensorUpdate(mac, port, isOccupied) {
        const slot = await slotRepository.findByDeviceAndPort(mac, port);
        if (!slot) return { error: "Thiết bị không tồn tại", code: 404 };

        if (slot.status === 'MAINTAIN') {
            return { changed: false, message: "Ô đang bảo trì", name: slot.name };
        }

        const newStatus = isOccupied ? 'OCCUPIED' : 'AVAILABLE';
        const oldStatus = slot.status;

        if (oldStatus !== newStatus) {
            await slotRepository.updateStatusSlot(slot.id, newStatus);
            return {
                changed: true,
                id: slot.id,
                lot_id: slot.lot_id,
                name: slot.name,
                oldStatus,
                newStatus
            };
        }
        return { changed: false, name: slot.name, status: slot.status };
    }

    // Lấy Dashboard
    async getLotDashboard(lotId) {
        const [slots, summary] = await Promise.all([
            slotRepository.getAllSlotsByLot(lotId),
            slotRepository.getCountSummary(lotId)
        ]);
        
        return {
            summary: {
                total: summary.total || 0,
                available: parseInt(summary.available) || 0,
                occupied: parseInt(summary.occupied) || 0,
                maintain: parseInt(summary.maintain) || 0
            },
            slots
        };
    }
}
export default new SlotService();