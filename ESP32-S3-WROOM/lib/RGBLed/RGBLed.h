#ifndef RGB_LED_H
#define RGB_LED_H

#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

void rgbInit(uint8_t pin);
void rgbSetIdle();       // Purple - waiting
void rgbSetAccepted();   // Green 3s then back to idle
void rgbSetRejected();   // Red 3s then back to idle
void TaskRGBLed(void *pvParameters);

// Queue to receive commands from BackendClient
extern QueueHandle_t rgbQueue;

// RGB command types
enum RGBCommand {
    RGB_IDLE = 0,
    RGB_ACCEPTED = 1,
    RGB_REJECTED = 2
};

#endif