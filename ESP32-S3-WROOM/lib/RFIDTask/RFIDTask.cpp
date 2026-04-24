#include "RFIDTask.h"
#include "Config.h"

static MFRC522 mfrc522(RFID_SS_PIN, RFID_RST_PIN);
QueueHandle_t rfidQueue = NULL;

void rfidInit() {
    SPI.begin();
    mfrc522.PCD_Init();
    delay(100);
    mfrc522.PCD_DumpVersionToSerial();

    // Queue chứa tối đa 5 UID string (mỗi UID tối đa 20 ký tự)
    rfidQueue = xQueueCreate(5, sizeof(char[21]));
    if (rfidQueue == NULL) {
        Serial.println("[RFID] ERROR: Failed to create queue!");
    }
    Serial.println("[RFID] Initialized");
}

void TaskRFIDRead(void *pvParameters) {
    char uidStr[21];

    while (1) {
        // Kiểm tra có thẻ mới không
        if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
            // Chuyển UID bytes thành chuỗi HEX
            uidStr[0] = '\0';
            for (byte i = 0; i < mfrc522.uid.size; i++) {
                char hex[4];
                sprintf(hex, "%02X", mfrc522.uid.uidByte[i]);
                strcat(uidStr, hex);
            }

            Serial.printf("[RFID] Card detected: %s\n", uidStr);

            // Gửi UID vào queue để BackendClient xử lý
            xQueueSend(rfidQueue, uidStr, pdMS_TO_TICKS(100));

            mfrc522.PICC_HaltA();
            mfrc522.PCD_StopCrypto1();

            // Chống đọc trùng - chờ 1.5 giây trước khi đọc thẻ tiếp
            vTaskDelay(pdMS_TO_TICKS(1500));
        }

        vTaskDelay(pdMS_TO_TICKS(RFID_INTERVAL_MS));
    }
}
