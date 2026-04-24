#ifndef SENSOR_TASK_H
#define SENSOR_TASK_H

#include <Arduino.h>

// Sự kiện thay đổi trạng thái ô đỗ
struct SensorEvent {
    int  port;        // Số port (khớp với parking_slot.port_number trong DB)
    bool isOccupied;  // true = có xe, false = trống
};

// Queue chứa sự kiện thay đổi trạng thái (gửi sang BackendClient)
extern QueueHandle_t sensorQueue;

// Khởi tạo pin SR04 và tạo queue
void sensorInit(int trigPin, int echoPin);

// Đọc khoảng cách (cm), trả về -1 nếu timeout
float sensorReadDistanceCM();

// FreeRTOS Task: đọc SR04, phát hiện thay đổi trạng thái ô đỗ
void TaskSensorRead(void *pvParameters);

#endif
