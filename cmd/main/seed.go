package main

import (
	"database/sql"
	"fmt"
	"log"

	"backend/configs"
	"backend/pkg/database"

	"golang.org/x/crypto/bcrypt"
)

func seed(db *sql.DB) error {
	// ==========================================
	// Admin
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("lỗi hash password: %v", err)
	}

	// Cú pháp ON DUPLICATE KEY UPDATE id=id giúp mô phỏng hàm upsert (có rồi thì bỏ qua)
	adminQuery := `
		INSERT INTO users (email, first_name, last_name,  password, role, is_verified)
		VALUES (?, ?, ?, ?, 'ADMIN', true)
		ON DUPLICATE KEY UPDATE id=id
	`
	_, err = db.Exec(adminQuery, "admin@gmail.com", "Admin", "System", hashedPassword)
	if err != nil {
		return fmt.Errorf("lỗi seed admin: %v", err)
	}
	fmt.Println("✅ Admin: admin@gmail.com")

	// Parking Lot A
	lotQuery := `
		INSERT INTO parking_lots (id, name, location)
		VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE id=id
	`
	// Chèn cứng ID = 1 giống logic của bạn
	_, err = db.Exec(lotQuery, 1, "A", "Main Area")
	if err != nil {
		return fmt.Errorf("lỗi seed lot: %v", err)
	}
	fmt.Println("✅ Lot: A")

	// IoT Device
	deviceQuery := `
		INSERT INTO iot_devices (mac_address, device_name, status, lot_id)
		VALUES (?, ?, 'ACTIVE', ?)
		ON DUPLICATE KEY UPDATE
			device_name = VALUES(device_name),
			status = VALUES(status),
			lot_id = VALUES(lot_id)
	`
	_, err = db.Exec(deviceQuery, "DEVICE_A_001", "Gate Controller A", 1)
	if err != nil {
		return fmt.Errorf("lỗi seed device: %v", err)
	}
	fmt.Println("✅ Device: DEVICE_A_001")

	// 8 Parking Slots
	slotQuery := `
		INSERT INTO parking_slots (name, lot_id, device_mac, port_number, status)
		VALUES (?, ?, ?, ?, 'AVAILABLE')
		ON DUPLICATE KEY UPDATE id=id
	`
	for i := 1; i <= 8; i++ {
		slotName := fmt.Sprintf("A%d", i)
		_, err = db.Exec(slotQuery, slotName, 1, "DEVICE_A_001", i)
		if err != nil {
			return fmt.Errorf("lỗi seed slot %s: %v", slotName, err)
		}
	}
	fmt.Println("✅ 8 slots created")

	return nil
}

func main() {
	cfg := configs.LoadConfig()
	db := database.NewMySQL(cfg)
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("❌ Lỗi khi lấy instance sql.DB: %v", err)
	}

	defer sqlDB.Close()
	if err := seed(sqlDB); err != nil {
		log.Fatalf("❌ Lỗi trong quá trình seed: %v", err)
	}

	fmt.Println("🎉 Seed hoàn tất thành công!")
}
