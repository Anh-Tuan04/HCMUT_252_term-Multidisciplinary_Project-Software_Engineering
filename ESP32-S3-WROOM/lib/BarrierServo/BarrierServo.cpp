#include "BarrierServo.h"
#include "Config.h"

static Servo _servo;
static volatile bool _gateOpen = false;
static volatile unsigned long _openTimestamp = 0;

void barrierInit(int pin) {
    _servo.attach(pin);
    _servo.write(0);
    Serial.println("[Barrier] Initialized - CLOSED");
}

void barrierOpen() {
    _gateOpen = true;
    _openTimestamp = millis();
    _servo.write(90);
    Serial.println("[Barrier] OPENED");
}

void barrierClose() {
    _gateOpen = false;
    _servo.write(0);
    Serial.println("[Barrier] CLOSED");
}

bool barrierIsOpen() {
    return _gateOpen;
}

// Task tự đóng barie sau thời gian BARRIER_OPEN_MS
void TaskBarrierAutoClose(void *pvParameters) {
    while (1) {
        if (_gateOpen && (millis() - _openTimestamp >= BARRIER_OPEN_MS)) {
            barrierClose();
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
