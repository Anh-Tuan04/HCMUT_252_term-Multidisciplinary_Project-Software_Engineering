CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

-- =========================
-- 1. PARKING SLOTS
-- =========================
CREATE TABLE IF NOT EXISTS parking_slots (
    id VARCHAR(36) PRIMARY KEY,
    slot_code VARCHAR(20) UNIQUE,
    status ENUM('EMPTY', 'OCCUPIED', 'MAINTENANCE') DEFAULT 'EMPTY',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- 2. PARKING CARDS
-- =========================
CREATE TABLE IF NOT EXISTS parking_cards (
    id VARCHAR(50) PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================
-- 3. PARKING SESSIONS
-- =========================
CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_id VARCHAR(36) NOT NULL,
    card_id VARCHAR(50),

    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,

    status ENUM('ACTIVE', 'COMPLETED') DEFAULT 'ACTIVE',

    FOREIGN KEY (slot_id) REFERENCES parking_slots(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES parking_cards(id)
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_slots_status ON parking_slots(status);

CREATE INDEX idx_sessions_card ON parking_sessions(card_id);
CREATE INDEX idx_sessions_status ON parking_sessions(status);
CREATE INDEX idx_sessions_slot ON parking_sessions(slot_id);

CREATE INDEX idx_logs_slot ON sensor_logs(slot_id);
CREATE INDEX idx_logs_time ON sensor_logs(created_at);

-- =========================
-- MOCK DATA FOR TESTING
-- =========================
INSERT INTO parking_slots (id, slot_code, status) VALUES 
(UUID(), 'A1', 'EMPTY'),
(UUID(), 'A2', 'EMPTY'),
(UUID(), 'A3', 'EMPTY'),
(UUID(), 'B1', 'EMPTY'),
(UUID(), 'B2', 'EMPTY') AS new
ON DUPLICATE KEY UPDATE 
slot_code = new.slot_code,
status = new.status;