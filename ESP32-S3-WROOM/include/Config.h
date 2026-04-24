#ifndef CONFIG_H
#define CONFIG_H

// ─── WiFi Station (kết nối tới router để gửi dữ liệu lên backend) ───
#define WIFI_SSID          "The Loc"
#define WIFI_PASSWORD      "66666666"

// ─── Go Backend Server ───
#define BACKEND_BASE_URL   "http://192.168.1.134:8081"
#define RFID_ENDPOINT      "/api/v1/iot/rfid"
#define SENSOR_ENDPOINT    "/api/v1/parking-slots/sensor"

// ─── Gate Configuration (khớp với seed data trong backend) ───
#define GATE_ID            1
#define GATE_MAC_ADDRESS   "GATE_IN_A_001"

// ─── Sensor Configuration ───
#define SENSOR_MAC         "SENSOR_A_001"
#define SENSOR_PORT        1

// ─── Pin Definitions ───
#define SERVO_PIN          38
#define BUILTIN_LED_PIN    48

// MFRC522 (SPI)
#define RFID_SS_PIN        10
#define RFID_RST_PIN       47

// HC-SR04 Ultrasonic
#define SR04_TRIG_PIN      6
#define SR04_ECHO_PIN      7

// I2C (LCD)
#define I2C_SDA_PIN        8
#define I2C_SCL_PIN        9

// ─── Thresholds & Timing ───
#define BARRIER_OPEN_MS       5000   // Tự đóng barie sau 5 giây
#define SENSOR_INTERVAL_MS    1000   // Đọc SR04 mỗi 1 giây
#define RFID_INTERVAL_MS      200    // Kiểm tra thẻ mỗi 200ms
#define OCCUPY_DISTANCE_CM    20     // Khoảng cách < 20cm = có xe

#endif
