
#include <SPI.h>
#include "ArduinoMotorShieldR3.h"

int chipSelectPin1=10;
int chipSelectPin2=9;
int chipSelectPin3=8;

unsigned long lastStreamTime;     //To store the last streamed time stamp
unsigned long StreamTime = 0;
//const int streamPeriod = 40;          //To stream at 25Hz without using additional timers (time period(ms) =1000/frequency(Hz))
float speed_in_CPS = 0;
int ARRAYLENGHT = 7200;
int maxStreamTime = 2000000;
unsigned long StreamTimeArr[7200];
float speedArr[7200];
ArduinoMotorShieldR3 md;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  
  pinMode(chipSelectPin1, OUTPUT);
  pinMode(chipSelectPin2, OUTPUT);
  pinMode(chipSelectPin3, OUTPUT);

  digitalWrite(chipSelectPin1, HIGH);
  digitalWrite(chipSelectPin2, HIGH);
  digitalWrite(chipSelectPin3, HIGH);
 
 LS7366_Init();

  delay(100);
  Serial.println("Arduino Motor Shield R3");
  md.init();
}

void loop() {
  // put your main code here, to run repeatedly:
  int prevEncoderValue = getEncoderValue(3) ;
  int currEncoderValue = 0;
  int count = 0;
  md.setM1Speed(200);
  Serial.print("Motor Characterisation");
  lastStreamTime = micros();
  while (StreamTime < maxStreamTime){
    //Serial.println("Entered loop");
    speedArr[count] = speed_in_CPS;
    StreamTimeArr[count] = StreamTime;
    StreamTime = micros();
    currEncoderValue = getEncoderValue(3); 
    float counts = (float)(currEncoderValue-prevEncoderValue);
    float timeElapse = (float)((StreamTime-lastStreamTime));
    speed_in_CPS = (float)(float(1000000*counts)/timeElapse);
    lastStreamTime = StreamTime;
    prevEncoderValue = currEncoderValue;
    count ++;
    delay(1);
    }

  md.setM1Speed(0);
  delay(100);
  Serial.println("Time Array");
  for (int i = 0; i <= 750; i = i + 1){
    Serial.println(StreamTimeArr[i]);
    }

  Serial.println("Speed Array");
  for (int i = 0; i <= 750; i = i + 1){
    Serial.println(speedArr[i]);
    }

    while (1){
      }
}

long getEncoderValue(int encoder)
{
  unsigned int count1Value, count2Value, count3Value, count4Value;
  long result;

  selectEncoder(encoder);

  SPI.transfer(0x60); // Request count
  count1Value = SPI.transfer(0x00); // Read highest order byte
  count2Value = SPI.transfer(0x00);
  count3Value = SPI.transfer(0x00);
  count4Value = SPI.transfer(0x00); // Read lowest order byte 

  deselectEncoder(encoder);

  result= ((long)count1Value<<24) + ((long)count2Value<<16) + ((long)count3Value<<8) + (long)count4Value;

  return result;
  }

void selectEncoder(int encoder)
{
  switch(encoder)
  {
    case 1:
      digitalWrite(chipSelectPin1,LOW);
      break;
    case 2:
      digitalWrite(chipSelectPin2,LOW);
      break;
    case 3:
      digitalWrite(chipSelectPin3,LOW);
      break;
    }
  }

void deselectEncoder(int encoder)
{
  switch(encoder)
  {
    case 1:
      digitalWrite(chipSelectPin1,HIGH);
      break;
    case 2:
      digitalWrite(chipSelectPin2,HIGH);
      break;
    case 3:
      digitalWrite(chipSelectPin3,HIGH);
      break;
    }
  }

void LS7366_Init(void)
{
  // SPI initialization
  SPI.begin();
  //SPI.setClockDivider(SPI_CLOCK_DIV16);      // SPI at 1Mhz (on 16Mhz clock)
  delay(10);

   digitalWrite(chipSelectPin1,LOW);
   SPI.transfer(0x88); 
   SPI.transfer(0x03);
   digitalWrite(chipSelectPin1,HIGH); 
   
   
   digitalWrite(chipSelectPin2,LOW);
   SPI.transfer(0x88); 
   SPI.transfer(0x03);
   digitalWrite(chipSelectPin2,HIGH); 
   
   
   digitalWrite(chipSelectPin3,LOW);
   SPI.transfer(0x88); 
   SPI.transfer(0x03);
   digitalWrite(chipSelectPin3,HIGH); 
  
  }
