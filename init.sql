CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;
-- Bảng Bãi Xe (Parking Lots)
CREATE TABLE parking_lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255)
);
-- Bảng Bộ Điều Khiển (IoT Devices)
CREATE TABLE iot_devices (
    mac_address VARCHAR(50) PRIMARY KEY,
    lot_id INT,
    device_name VARCHAR(50),
    FOREIGN KEY (lot_id) REFERENCES parking_lots(id)
);
-- Bảng Ô Đỗ (Parking Slots)
CREATE TABLE parking_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    -- Thuộc bãi nào
    lot_id INT NOT NULL,
    -- Cắm vào con ESP32 nào
    device_mac VARCHAR(50) NOT NULL,
    -- Cắm vào cổng số mấy trên ESP32 (1, 2, 3...)
    port_number INT NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTAIN') DEFAULT 'AVAILABLE',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES parking_lots(id),
    FOREIGN KEY (device_mac) REFERENCES iot_devices(mac_address),
    UNIQUE KEY unique_port_per_device (device_mac, port_number),
    UNIQUE KEY unique_slot_per_lot (lot_id, name)
);
-- INDEXES
-- Index theo trạng thái ô đỗ
CREATE INDEX idx_status ON parking_slots(status);
-- Index theo bãi xe (Để JOIN và lọc theo bãi xe)
CREATE INDEX idx_lot_id ON parking_slots(lot_id);
-- Index theo thiết bị
CREATE INDEX idx_device_mac ON parking_slots(device_mac);
-- Index cho bảng thiết bị (Tìm thiết bị theo bãi)
CREATE INDEX idx_iot_lot ON iot_devices(lot_id);
