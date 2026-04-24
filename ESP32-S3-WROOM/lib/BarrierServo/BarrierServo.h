#ifndef BARRIER_SERVO_H
#define BARRIER_SERVO_H

#include <Arduino.h>
#include <ESP32Servo.h>

// Khởi tạo servo trên pin chỉ định
void barrierInit(int pin);

// Mở barie (servo quay 90 độ)
void barrierOpen();

// Đóng barie (servo quay về 0 độ)
void barrierClose();

// Kiểm tra trạng thái barie
bool barrierIsOpen();

// FreeRTOS Task: tự đóng barie sau BARRIER_OPEN_MS
void TaskBarrierAutoClose(void *pvParameters);

#endif
