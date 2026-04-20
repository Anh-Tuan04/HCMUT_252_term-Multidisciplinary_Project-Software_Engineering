CREATE TABLE users (
                       id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                       first_name VARCHAR(100) NOT NULL,
                       last_name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER',
                       is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                       CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE parking_lots (
                              id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                              name VARCHAR(100) NOT NULL,
                              location VARCHAR(255) NULL,
                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE iot_devices (
                             mac_address VARCHAR(50) PRIMARY KEY,
                             device_name VARCHAR(50) NULL,
                             status ENUM('ACTIVE', 'INACTIVE', 'ERROR') NOT NULL DEFAULT 'ACTIVE',
                             lot_id BIGINT UNSIGNED NULL,
                             last_seen DATETIME NULL,
                             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                             CONSTRAINT fk_iot_devices_lot
                                 FOREIGN KEY (lot_id) REFERENCES parking_lots(id)
                                     ON DELETE SET NULL
                                     ON UPDATE CASCADE
);

CREATE INDEX idx_iot_devices_lot_id ON iot_devices(lot_id);
CREATE INDEX idx_iot_devices_lot_id_status ON iot_devices(lot_id, status);

CREATE TABLE parking_slots (
                               id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                               name VARCHAR(10) NOT NULL,
                               lot_id BIGINT UNSIGNED NOT NULL,
                               device_mac VARCHAR(50) NOT NULL,
                               port_number INT NOT NULL,
                               status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTAIN') NOT NULL DEFAULT 'AVAILABLE',
                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                               CONSTRAINT fk_parking_slots_lot
                                   FOREIGN KEY (lot_id) REFERENCES parking_lots(id)
                                       ON DELETE RESTRICT
                                       ON UPDATE CASCADE,

                               CONSTRAINT fk_parking_slots_device
                                   FOREIGN KEY (device_mac) REFERENCES iot_devices(mac_address)
                                       ON DELETE RESTRICT
                                       ON UPDATE CASCADE,

                               CONSTRAINT uq_parking_slots_lot_name UNIQUE (lot_id, name),
                               CONSTRAINT uq_parking_slots_device_port UNIQUE (device_mac, port_number)
);

CREATE INDEX idx_parking_slots_lot_id_status ON parking_slots(lot_id, status);
CREATE INDEX idx_parking_slots_lot_id ON parking_slots(lot_id);
CREATE INDEX idx_parking_slots_device_mac ON parking_slots(device_mac);

CREATE TABLE refresh_tokens (
                                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                token_hash VARCHAR(255) NOT NULL,
                                device VARCHAR(100) NULL,
                                ip VARCHAR(45) NULL,
                                expires_at DATETIME NOT NULL,
                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                user_id BIGINT UNSIGNED NOT NULL,

                                CONSTRAINT uq_refresh_tokens_token_hash UNIQUE (token_hash),

                                CONSTRAINT fk_refresh_tokens_user
                                    FOREIGN KEY (user_id) REFERENCES users(id)
                                        ON DELETE CASCADE
                                        ON UPDATE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE slot_histories (
                                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                                slot_id BIGINT UNSIGNED NOT NULL,
                                old_device VARCHAR(50) NULL,
                                new_device VARCHAR(50) NULL,
                                old_port INT NULL,
                                new_port INT NULL,
                                action ENUM('DEVICE_CHANGE', 'STATUS_CHANGE', 'SYSTEM_FIX', 'MAINTAIN_MODE') NOT NULL DEFAULT 'DEVICE_CHANGE',
                                user_id BIGINT UNSIGNED NULL,
                                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                CONSTRAINT fk_slot_histories_slot
                                    FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
                                        ON DELETE CASCADE
                                        ON UPDATE CASCADE,

                                CONSTRAINT fk_slot_histories_user
                                    FOREIGN KEY (user_id) REFERENCES users(id)
                                        ON DELETE SET NULL
                                        ON UPDATE CASCADE
);

CREATE INDEX idx_slot_histories_slot_id ON slot_histories(slot_id);
CREATE INDEX idx_slot_histories_user_id ON slot_histories(user_id);
CREATE INDEX idx_slot_histories_created_at ON slot_histories(created_at);
CREATE INDEX idx_slot_histories_slot_id_created_at ON slot_histories(slot_id, created_at);

CREATE TABLE vehicle_logs (
                              id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                              slot_id BIGINT UNSIGNED NOT NULL,
                              type ENUM('IN', 'OUT') NOT NULL,
                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_vehicle_logs_slot
                                  FOREIGN KEY (slot_id) REFERENCES parking_slots(id)
                                      ON DELETE CASCADE
                                      ON UPDATE CASCADE
);

CREATE INDEX idx_vehicle_logs_slot_id ON vehicle_logs(slot_id);
CREATE INDEX idx_vehicle_logs_created_at ON vehicle_logs(created_at);
CREATE INDEX idx_vehicle_logs_slot_id_created_at ON vehicle_logs(slot_id, created_at);