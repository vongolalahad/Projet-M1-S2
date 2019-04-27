#include <Wire.h>
#include "Adafruit_TCS34725.h"
#include <dht.h>
#include <time.h>

dht DHT;

#define DHT11_PIN 8

/* Example code for the Adafruit TCS34725 breakout library */

/* Connect SCL to analog 5
  Connect SDA to analog 4
  Connect VDD to 3.3V DC
  Connect GROUND to common ground */

/* Initialise with default values (int time = 2.4ms, gain = 1x) */
// Adafruit_TCS34725 tcs = Adafruit_TCS34725();

/* Initialise with specific int time and gain values */
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_700MS, TCS34725_GAIN_1X);
int lightLevel;

void setup()
{
  Serial.begin(9600);
  if (tcs.begin()) {
    Serial.println("Found sensor");
  } else {
    Serial.println("No TCS34725 found ... check your connections");
    while (1);
  }

}
void loop()
{
  lightLevel = analogRead(A1);
  float volts = analogRead(A1) * 5.0 / 1024.0;
  float amps = volts / 10000.0;  // across 10,000 Ohms
  float microamps = amps * 1000000;
  int luxtemt = microamps * 2.0;

  uint16_t r, g, b, c, colorTemp, lux;


  tcs.getRawData(&r, &g, &b, &c);
  colorTemp = tcs.calculateColorTemperature(r, g, b);
  lux = tcs.calculateLux(r, g, b);
  int chk = DHT.read11(DHT11_PIN);
  Serial.print(DHT.temperature);Serial.print(",");
  Serial.print(r, DEC); Serial.print(",");
  Serial.print(g, DEC); Serial.print(",");
  Serial.print(b, DEC); Serial.print(",");
  Serial.print(DHT.humidity);Serial.print(",");
  Serial.print(luxtemt, DEC);
  Serial.print("\n");
  delay(2000);

}
