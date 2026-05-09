// Akwasi D. Akosah
// ENGS 147
// Lab 4 -- Motor Position Control
// -- method of discrete approximation


//Robogaia.com
// the sensor communicates using SPI, so include the library:
#include <SPI.h>
#include <math.h>
#include "ArduinoMotorShieldR3.h"


int chipSelectPin1=10;
int chipSelectPin2=9;
int chipSelectPin3=8;
//end calibration values
//////////////////////////////////////////////

/****** VARIABLE DEFINITIONS ********/
float referencePos = PI/3;
float K = 7.143;
float a = 0.9231;
float b = 0.5094;

int STREAMPERIOD = 10000; //10ms

float REVCOUNTS = 1440;
long prevEncoderValue,prevTime;
long currEncoderValue,currTime;



// array declarations
float errorSigArr[1000];
float posArr[1000];
long timeArr[1000];
long controlSigPWMArr[1000];
float controlSigVoltArr[1000];

float convArrayNeg[8] = {0.0014, 0.0380, 0.4064, 1.9781, 3.9145, 0, 0, -25.0693};
float convArrayPos[8] = {0.0008, -0.0196, 0.2093, -1.0939, 2.5244, 0, 0, 24.9646};

ArduinoMotorShieldR3 md;
//****************************************/
void setup() {
//**************************************
  // put your setup code here, to run once:
  Serial.begin(9600);

  pinMode(chipSelectPin1, OUTPUT);
  pinMode(chipSelectPin2, OUTPUT);
  pinMode(chipSelectPin3, OUTPUT);
  
  digitalWrite(chipSelectPin1, HIGH);
  digitalWrite(chipSelectPin2, HIGH);
  digitalWrite(chipSelectPin3, HIGH);
 
 LS7366_Init();

 delay(100);

 Serial.println("Proportional Control");
 md.init();
}

//***************************************
void loop() {
//***************************************
  // put your main code here, to run repeatedly:
  long encoderCounts;
  uint16_t counts = 0;
  float instPos;
  float controlEffort;
  float controlSig;
  float errorSig;
  int controlSigPWM;

  errorSigArr[0] = 0.00;
  controlSigVoltArr[0] = 0.00;
  
  
  md.setM1Speed(0);
  delay(500);  
  prevEncoderValue = getEncoderValue(3);
  long startTime = micros();
  prevTime = startTime;
  

  while (counts <= 300)
  {
    //
    currTime = micros();

    if ((currTime - prevTime) >= STREAMPERIOD)
    {
      counts ++;
      currEncoderValue = getEncoderValue(3);
      encoderCounts = currEncoderValue - prevEncoderValue;
      
      //instVel = (float)(encoderCounts*1000000.0)/(float)(STREAMPERIOD);
      instPos = float(float(encoderCounts*2*PI)/float(REVCOUNTS));
      
      errorSig = referencePos - instPos;  // rad/s
      //controlEffort = compGain*errorSig; 

      // control law from discrete approximation
      controlEffort = b*controlSigVoltArr[counts - 1] + K*errorSig - K*a*errorSigArr[counts -1];
      
      
      //controlSigPWM = convertToPWMmodel(controlEffort);
      controlSigPWM = (int)(controlEffort * (400.0/9.6));
      md.setM1Speed(controlSigPWM);
      timeArr[counts] = currTime - startTime;
      posArr[counts] = instPos;
      controlSigPWMArr[counts] = controlSigPWM;
      controlSigVoltArr[counts] = controlEffort;
      errorSigArr[counts] = errorSig;
      prevTime = currTime;

      // make square wave
      if (counts % 37 == 0){
        referencePos = -referencePos;
        prevEncoderValue = getEncoderValue(3);
        }
      }
    }

    md.setM1Speed(0);
    delay(100);

    for (int i = 0; i<= 148; i++)
    {
     Serial.print(timeArr[i]);
     Serial.print("    ");
     Serial.print(posArr[i]);
     Serial.print("    ");
     Serial.print(errorSigArr[i]);
     Serial.print("    ");
     Serial.print(controlSigPWMArr[i]);
     Serial.print("    ");
     Serial.print(controlSigVoltArr[i]);
     Serial.print("    ");
     Serial.println("");
      }

      while(1){
        }
}

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

int convertToPWM(float controlSig)
{
  int PWMcontrol;
  PWMcontrol = (int)(controlSig * (400.0/9.6));
  return PWMcontrol;
  } // end func

int convertToPWMmodel(float controlSig)
{
  float PWMcontrol = 0.0;
    if (controlSig >= 0){
      PWMcontrol = convertToPWMPicewisePos(controlSig);
      }
      else{
        PWMcontrol = convertToPWMPicewiseNeg(controlSig);
        }
    if (PWMcontrol > 400.0){
      PWMcontrol = 400.0;
      }
    else if(PWMcontrol < -400.0){
      PWMcontrol = -400.0;
      }
  return (int)(PWMcontrol);
  }

 int convertToPWMPicewisePos(float controlSig)
 {
  float PWMControl = 0.00;
  if (controlSig > 9.34 && controlSig <= 9.74)
      PWMControl = 250.0*controlSig - 2035;
  else if (controlSig > 8.64 && controlSig <= 9.34)
      PWMControl = 142.86*controlSig - 1034.29;
  else if (controlSig > 6.91 && controlSig <= 8.64)
      PWMControl = 57.80*controlSig - 299.42;
  else if (controlSig > 3.57 && controlSig <= 6.91)
      PWMControl = 14.97*controlSig - 3.44;
  else if (controlSig > 0.25 && controlSig <= 3.57)
      PWMControl = 7.53*controlSig + 23.12;
  else if (controlSig >= 0.00 && controlSig <= 0.25)
      PWMControl = 100.0*controlSig;

  return PWMControl;
  }

 int convertToPWMPicewiseNeg(float controlSig)
 {
  float PWMControl = 0.00;
  if (controlSig >= -9.76 && controlSig < -9.34)
      PWMControl = 238.10*controlSig + 1923.81;
  else if (controlSig >= -9.34 && controlSig < -8.64)
      PWMControl = 142.86*controlSig + 1034.29;
  else if (controlSig >= -8.64 && controlSig < -6.91)
      PWMControl = 57.80*controlSig + 299.42;
  else if (controlSig >= -6.91 && controlSig < -3.57)
      PWMControl = 14.97*controlSig + 3.44;
  else if (controlSig >= -3.57 && controlSig < -0.25)
      PWMControl = 7.53*controlSig - 23.12;
  else if (controlSig >= -0.25 && controlSig < 0.00)
      PWMControl = 100.0*controlSig;

  return PWMControl;
  }
