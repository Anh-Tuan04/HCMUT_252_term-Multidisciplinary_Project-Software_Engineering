#include "BackendClient.h"
#include "Config.h"
#include "RFIDTask.h"
#include "SensorTask.h"
#include "BarrierServo.h"
#include "RGBLed.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

QueueHandle_t lcdQueue = NULL;

void connectWiFi(const char* ssid, const char* password) {
    Serial.printf("[WiFi] Connecting to %s", ssid);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 40) {
        delay(500);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[WiFi] FAILED to connect!");
    }
}

static void handleRFID(const char* uid) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[Backend] WiFi not connected, skip RFID POST");
        return;
    }

    StaticJsonDocument<256> doc;
    doc["gate_id"]     = GATE_ID;
    doc["mac_address"] = GATE_MAC_ADDRESS;
    doc["rfid_uid"]    = uid;

    String jsonBody;
    serializeJson(doc, jsonBody);

    HTTPClient http;
    String url = String(BACKEND_BASE_URL) + RFID_ENDPOINT;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    Serial.printf("[Backend] POST %s\n", url.c_str());
    Serial.printf("[Backend] Body: %s\n", jsonBody.c_str());

    int httpCode = http.POST(jsonBody);

    if (httpCode > 0) {
        String response = http.getString();
        Serial.printf("[Backend] Response (%d): %s\n", httpCode, response.c_str());

        StaticJsonDocument<512> resDoc;
        DeserializationError err = deserializeJson(resDoc, response);

        if (!err && resDoc.containsKey("data")) {
            const char* action = resDoc["data"]["action"] | "reject";
            const char* lcdLine1 = resDoc["data"]["lcd_line1"] | "";
            const char* lcdLine2 = resDoc["data"]["lcd_line2"] | "";

            if (strcmp(action, "open_barrier") == 0) {
                barrierOpen();
                Serial.println("[Backend] -> Barrier OPENED");
                // RGB: Green for 3 seconds
                RGBCommand cmd = RGB_ACCEPTED;
                if (rgbQueue != NULL) xQueueSend(rgbQueue, &cmd, pdMS_TO_TICKS(100));
            } else {
                Serial.printf("[Backend] -> REJECTED: %s\n", lcdLine2);
                // RGB: Red for 3 seconds
                RGBCommand cmd = RGB_REJECTED;
                if (rgbQueue != NULL) xQueueSend(rgbQueue, &cmd, pdMS_TO_TICKS(100));
            }

            // Send to LCD
            LCDMessage msg;
            strncpy(msg.line1, lcdLine1, 16); msg.line1[16] = '\0';
            strncpy(msg.line2, lcdLine2, 16); msg.line2[16] = '\0';
            if (lcdQueue != NULL) {
                xQueueSend(lcdQueue, &msg, pdMS_TO_TICKS(100));
            }
        }
    } else {
        Serial.printf("[Backend] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

static void handleSensor(const SensorEvent* event) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[Backend] WiFi not connected, skip Sensor POST");
        return;
    }

    StaticJsonDocument<128> doc;
    doc["mac"]         = SENSOR_MAC;
    doc["port"]        = event->port;
    doc["is_occupied"] = event->isOccupied;

    String jsonBody;
    serializeJson(doc, jsonBody);

    HTTPClient http;
    String url = String(BACKEND_BASE_URL) + SENSOR_ENDPOINT;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    Serial.printf("[Backend] POST %s\n", url.c_str());

    int httpCode = http.POST(jsonBody);

    if (httpCode > 0) {
        String response = http.getString();
        Serial.printf("[Backend] Sensor response (%d): %s\n", httpCode, response.c_str());
    } else {
        Serial.printf("[Backend] Sensor POST failed: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
}

void TaskBackendClient(void *pvParameters) {
    lcdQueue = xQueueCreate(3, sizeof(LCDMessage));

    while (WiFi.status() != WL_CONNECTED) {
        vTaskDelay(pdMS_TO_TICKS(1000));
    }

    Serial.println("[Backend] Task started, ready to send data");

    char uidBuffer[21];
    SensorEvent sensorEvent;

    while (1) {
        if (rfidQueue != NULL &&
            xQueueReceive(rfidQueue, uidBuffer, pdMS_TO_TICKS(50)) == pdTRUE) {
            handleRFID(uidBuffer);
        }

        if (sensorQueue != NULL &&
            xQueueReceive(sensorQueue, &sensorEvent, pdMS_TO_TICKS(50)) == pdTRUE) {
            handleSensor(&sensorEvent);
        }

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}