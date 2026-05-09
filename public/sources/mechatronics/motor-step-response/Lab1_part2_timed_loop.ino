//Robogaia.com
// the sensor communicates using SPI, so include the library:
#include <SPI.h>
#include "ArduinoMotorShieldR3.h"


int chipSelectPin1=10;
int chipSelectPin2=9;
int chipSelectPin3=8;
//end calibration values
//////////////////////////////////////////////

/// constants for timed loop
long prevTime,currTime;
long streamPeriod = 5000;
long prevEncoder3Value;
long currEncoder3Value;
unsigned long timeArr[1000];
float velArr[1000];  
ArduinoMotorShieldR3 md;

//*****************************************************
void setup() 
//*****************************************************
{
  Serial.begin(9600);

  pinMode(chipSelectPin1, OUTPUT);
  pinMode(chipSelectPin2, OUTPUT);
  pinMode(chipSelectPin3, OUTPUT);
  
  digitalWrite(chipSelectPin1, HIGH);
  digitalWrite(chipSelectPin2, HIGH);
  digitalWrite(chipSelectPin3, HIGH);
 
 LS7366_Init();

 delay(100);

 //Serial.println("Arduino Motor Shield R3");
 md.init();

  
}

//*****************************************************
void loop() 
//*****************************************************
{
  md.setM1Speed(0);
  delay(500);  
  prevEncoder3Value = getEncoderValue(3);
  prevTime = micros();
  md.setM1Speed(-400);
  uint16_t counts = 0;
  long encoderCounts;
  float vel = 0.00;

  // store initial speed and time
  timeArr[0] = prevTime;
  velArr[0] = vel;
  while (counts <= 500)
  {
    currTime = micros();

    if ((currTime - prevTime) >= streamPeriod)
    {
      counts ++;
      currEncoder3Value = getEncoderValue(3);
      encoderCounts = currEncoder3Value - prevEncoder3Value;
      vel = float(encoderCounts*1000000/streamPeriod);
      timeArr[counts] = currTime;
      velArr[counts] = vel;
      prevEncoder3Value = currEncoder3Value;
      prevTime = currTime;
      }
    }
    //delay(100);
    md.setM1Speed(0);
    delay(100);
    //Serial.println("Speed Array");
    for (int i = 0; i < 500; i ++)
    {
      Serial.println(velArr[i]);
    }
    
//    Serial.println("Time Array");
//    for (int i = 0; i < 500; i ++)
//    {
//      Serial.println(timeArr[i]);
//    }
    
    md.setM1Speed(0);
    while (1){
      }
    
        
 
}//end loop



  
//*****************************************************  
long getEncoderValue(int encoder)
//*****************************************************
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
}//end func

//*************************************************
void selectEncoder(int encoder)
//*************************************************
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
  }//end switch
  
}//end func

//*************************************************
void deselectEncoder(int encoder)
//*************************************************
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
  }//end switch
  
}//end func



// LS7366 Initialization and configuration
//*************************************************
void LS7366_Init(void)
//*************************************************
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
   
}//end func
