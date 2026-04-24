#ifndef BACKEND_CLIENT_H
#define BACKEND_CLIENT_H

#include <Arduino.h>

// Cấu trúc hiển thị LCD (nhận từ backend response)
struct LCDMessage {
    char line1[17]; // 16 ký tự + null
    char line2[17];
};

// Queue gửi nội dung hiển thị lên LCD
extern QueueHandle_t lcdQueue;

// Kết nối WiFi STA
void connectWiFi(const char* ssid, const char* password);

// FreeRTOS Task: nhận data từ rfidQueue & sensorQueue, POST lên backend
void TaskBackendClient(void *pvParameters);

#endif
