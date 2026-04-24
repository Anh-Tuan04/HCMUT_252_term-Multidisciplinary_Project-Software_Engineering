#include "RGBLed.h"
#include "Config.h"

static Adafruit_NeoPixel pixel(1, BUILTIN_LED_PIN, NEO_GRB + NEO_KHZ800);
QueueHandle_t rgbQueue = NULL;

void rgbInit(uint8_t pin) {
    pixel.setPin(pin);
    pixel.begin();
    pixel.setBrightness(30);
    rgbQueue = xQueueCreate(5, sizeof(RGBCommand));
    rgbSetIdle();
}

void rgbSetIdle() {
    pixel.setPixelColor(0, pixel.Color(148, 0, 211)); // Purple
    pixel.show();
}

void rgbSetAccepted() {
    pixel.setPixelColor(0, pixel.Color(0, 255, 0)); // Green
    pixel.show();
}

void rgbSetRejected() {
    pixel.setPixelColor(0, pixel.Color(255, 0, 0)); // Red
    pixel.show();
}

void TaskRGBLed(void *pvParameters) {
    rgbInit(BUILTIN_LED_PIN);
    RGBCommand cmd;

    while (1) {
        if (rgbQueue != NULL &&
            xQueueReceive(rgbQueue, &cmd, pdMS_TO_TICKS(100)) == pdTRUE) {
            switch (cmd) {
                case RGB_ACCEPTED:
                    rgbSetAccepted();
                    vTaskDelay(pdMS_TO_TICKS(3000));
                    rgbSetIdle();
                    break;
                case RGB_REJECTED:
                    rgbSetRejected();
                    vTaskDelay(pdMS_TO_TICKS(3000));
                    rgbSetIdle();
                    break;
                default:
                    rgbSetIdle();
                    break;
            }
        }
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}