#ifndef RFID_TASK_H
#define RFID_TASK_H

#include <Arduino.h>
#include <MFRC522.h>
#include <SPI.h>

// Queue chứa UID thẻ RFID đã quét (gửi sang BackendClient)
extern QueueHandle_t rfidQueue;

// Khởi tạo MFRC522 và tạo queue
void rfidInit();

// FreeRTOS Task: liên tục quét thẻ RFID
void TaskRFIDRead(void *pvParameters);

#endif
