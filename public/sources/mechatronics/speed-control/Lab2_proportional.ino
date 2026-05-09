// Akwasi D. Akosah
// ENGS 147
// Lab 2 -- Proportional Control of Motor Speed


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

/***** CONSTANTS *******/
//#define STREAMPERIOD      1000        
//#define REVCOUNTS         1440

/****** VARIABLE DEFINITIONS ********/
float referenceVel = 78.5;
float compGain = 0.12;
int STREAMPERIOD = 10000; //10ms
float REVCOUNTS = 1440;
long prevEncoderValue,prevTime;
long currEncoderValue,currTime;



// array declarations
float errorSigArr[1000];
float velArr[1000];
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
  float instVel;
  float controlEffort;
  float controlSig;
  float errorSig;
  int controlSigPWM;
  
  md.setM1Speed(0);
  delay(500);  
  prevEncoderValue = getEncoderValue(3);
  long startTime = micros();
  prevTime = startTime;
  

  while (counts <= 600)
  {
    currTime = micros();

    if ((currTime - prevTime) >= STREAMPERIOD)
    {
      currEncoderValue = getEncoderValue(3);
      encoderCounts = currEncoderValue - prevEncoderValue;
      
      instVel = (float)(encoderCounts*1000000.0)/(float)(STREAMPERIOD);
      instVel = (instVel/REVCOUNTS)*(2*PI);
      
      errorSig = referenceVel - instVel;  // rad/s
      controlEffort = compGain*errorSig;
      
      // convert control sig to PMW
      //controlSigPWM = convertToPWM(controlEffort);
      controlSigPWM = convertToPWMmodel(controlEffort);
      //controlSigPWM = (int)(controlEffort * (400.0/9.6));
      md.setM1Speed(controlSigPWM);
      timeArr[counts] = currTime - startTime;
      velArr[counts] = instVel;
      controlSigPWMArr[counts] = controlSigPWM;
      controlSigVoltArr[counts] = controlEffort;
      errorSigArr[counts] = errorSig;
      counts ++;
      prevTime = currTime;
      prevEncoderValue = currEncoderValue; 
      }
    }

    md.setM1Speed(0);
    delay(100);

    for (int i = 0; i<= 600; i++)
    {
     Serial.print(timeArr[i]);
     Serial.print("    ");
     Serial.print(velArr[i]);
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
  for (int i = 0; i < 8; i++)
  {
    if (controlSig > 0){
      PWMcontrol += (convArrayPos[i])*pow(controlSig,7-i);
      }
      else{
        PWMcontrol += (convArrayNeg[i])*pow(controlSig,7-i);
        }
    }
    if (PWMcontrol > 400.0){
      PWMcontrol = 400.0;
      }
    else if(PWMcontrol < -400.0){
      PWMcontrol = -400.0;
      }
  return (int)(PWMcontrol);
  }

  /****NOTES FROM PROFESSOR****/
  /**
  Turn motor off before you enter the loop
  Units of K*e is volts
  Use time constant to determine when we get to steady-state value
  5T
  If you have 90 rad/s as reference you will never saturate using a gain
  of 0.1 cos 9 V is well under the 9.6 saturation point of the motor
  Howver you might want a higher gain to improve response
  Can gauge Time constant from reference input you choose
  update moto pwm in loop
  At the start moto is turned on so we have a really large error (maybe 
  90 rad/s - ) rad/s 
  You can get away with a large sample time
  Just be careful of operating at saturation coz we hold first large error for
  **/
