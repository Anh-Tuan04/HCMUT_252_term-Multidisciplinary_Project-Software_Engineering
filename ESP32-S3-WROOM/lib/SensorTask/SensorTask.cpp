#include "SensorTask.h"
#include "Config.h"

static int _trigPin;
static int _echoPin;
static bool _lastOccupied = false;

QueueHandle_t sensorQueue = NULL;

void sensorInit(int trigPin, int echoPin) {
    _trigPin = trigPin;
    _echoPin = echoPin;
    pinMode(_trigPin, OUTPUT);
    pinMode(_echoPin, INPUT);

    sensorQueue = xQueueCreate(5, sizeof(SensorEvent));
    if (sensorQueue == NULL) {
        Serial.println("[SR04] ERROR: Failed to create queue!");
    }
    Serial.println("[SR04] Initialized");
}

float sensorReadDistanceCM() {
    // Gửi xung trigger 10µs
    digitalWrite(_trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(_trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(_trigPin, LOW);

    // Đo thời gian echo (timeout 30ms ~ khoảng 5m)
    long duration = pulseIn(_echoPin, HIGH, 30000);
    if (duration == 0) return -1.0f; // Timeout

    // Tính khoảng cách: v_sound = 340m/s = 0.034cm/µs, chia 2 vì đi-về
    return duration * 0.034f / 2.0f;
}

void TaskSensorRead(void *pvParameters) {
    // Chờ hệ thống ổn định
    vTaskDelay(pdMS_TO_TICKS(2000));

    // Đọc trạng thái ban đầu
    float initDist = sensorReadDistanceCM();
    if (initDist > 0) {
        _lastOccupied = (initDist < OCCUPY_DISTANCE_CM);
        Serial.printf("[SR04] Initial state: %s (%.1f cm)\n",
            _lastOccupied ? "OCCUPIED" : "AVAILABLE", initDist);
    }

    while (1) {
        float distance = sensorReadDistanceCM();

        if (distance > 0) {
            bool occupied = (distance < OCCUPY_DISTANCE_CM);

            // Chỉ gửi event khi trạng thái THAY ĐỔI (tránh spam backend)
            if (occupied != _lastOccupied) {
                _lastOccupied = occupied;

                SensorEvent event;
                event.port = SENSOR_PORT;
                event.isOccupied = occupied;

                Serial.printf("[SR04] State CHANGED: %s (%.1f cm)\n",
                    occupied ? "OCCUPIED" : "AVAILABLE", distance);

                xQueueSend(sensorQueue, &event, pdMS_TO_TICKS(100));
            }
        }

        vTaskDelay(pdMS_TO_TICKS(SENSOR_INTERVAL_MS));
    }
}
