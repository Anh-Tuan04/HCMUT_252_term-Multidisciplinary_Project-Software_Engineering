import pool from '../config/db.js';

class SlotRepository {
    // Lấy danh sách ô theo bãi
    async getAllSlotsByLot(lotId) {
        const sql = 'SELECT * FROM parking_slots WHERE lot_id = ? ORDER BY name ASC';
        const [rows] = await pool.query(sql, [lotId]);
        return rows;
    }

    // Đếm số lượng
    async getCountSummary(lotId) {
        const sql = `
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN status = 'MAINTAIN' THEN 1 ELSE 0 END) as maintain
            FROM parking_slots
            WHERE lot_id = ?
        `;
        const [rows] = await pool.query(sql, [lotId]);
        return rows[0];
    }

    // Tìm ô đỗ dựa trên MAC và Port
    async findByDeviceAndPort(mac, port) {
        const sql = `
            SELECT id, status, lot_id, name
            FROM parking_slots
            WHERE device_mac = ? AND port_number = ?
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [mac, port]);
        return rows[0];
    }

    async updateStatusSlot(id, status) {
        return await pool.query('UPDATE parking_slots SET status = ? WHERE id = ?', [status, id]);
    }
}
export default new SlotRepository();