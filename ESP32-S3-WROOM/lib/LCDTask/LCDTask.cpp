#include "LCDTask.h"
#include "BackendClient.h"

LiquidCrystal_I2C lcd(0x27, 16, 2);

void initLCD() {
    lcd.begin();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Smart Parking");
    lcd.setCursor(0, 1);
    lcd.print("Ready...");
}

void TaskLCD(void *pvParameters) {
    LCDMessage msg;
    unsigned long lastMsgTime = 0;
    bool showingMsg = false;

    while (1) {
        if (lcdQueue != NULL &&
            xQueueReceive(lcdQueue, &msg, pdMS_TO_TICKS(100)) == pdTRUE) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print(msg.line1);
            lcd.setCursor(0, 1);
            lcd.print(msg.line2);

            lastMsgTime = millis();
            showingMsg = true;

            Serial.printf("[LCD] %s | %s\n", msg.line1, msg.line2);
        }

        if (showingMsg && (millis() - lastMsgTime >= 5000)) {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Smart Parking");
            lcd.setCursor(0, 1);
            lcd.print("Ready...");
            showingMsg = false;
        }

        vTaskDelay(pdMS_TO_TICKS(200));
    }
}