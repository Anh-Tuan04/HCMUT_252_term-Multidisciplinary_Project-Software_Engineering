#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>

#include "Config.h"
#include "BarrierServo.h"
#include "RFIDTask.h"
#include "SensorTask.h"
#include "BackendClient.h"
#include "LCDTask.h"
#include "RGBLed.h"

void setup() {
    Serial.begin(115200);
    delay(2000);
    Serial.println("\n========== SMART PARKING - ESP32 ==========");

    Serial.println("[1/6] RGB LED...");
    xTaskCreate(TaskRGBLed, "RGB_LED", 4096, NULL, 0, NULL);

    Serial.println("[2/6] Wire I2C...");
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

    Serial.println("[3/6] LCD...");
    initLCD();

    Serial.println("[4/6] RFID RC522...");
    rfidInit();

    Serial.println("[5/6] SR04 sensor...");
    sensorInit(SR04_TRIG_PIN, SR04_ECHO_PIN);

    Serial.println("[6/6] WiFi...");
    connectWiFi(WIFI_SSID, WIFI_PASSWORD);

    xTaskCreate(TaskRFIDRead,         "RFID_Read",     4096, NULL, 2, NULL);
    xTaskCreate(TaskSensorRead,       "SR04_Read",     4096, NULL, 1, NULL);
    xTaskCreate(TaskBackendClient,    "Backend",       8192, NULL, 2, NULL);
    xTaskCreate(TaskLCD,              "LCD_Display",   4096, NULL, 1, NULL);

    Serial.println("\n[OK] All tasks created!");
}

void loop() {
}