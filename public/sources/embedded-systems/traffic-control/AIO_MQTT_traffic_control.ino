/*********************************************************
 AIO_MQTT_traffic_control: Connect to Adafruit IO via MQTT, uses controls to 
 enter maintenance mode and signify train is crossing.

  A.D Akosah , 03/12/2021
  ENGS 85 21W
  IoT Lab
  Used template from E.W. Hansen AIO_MQTT_LED_pot

  Hardware: UNO R3 + Airlift shield
  Sensor : TMP36 Temperature Sensor
           used Pin A0 as Analog Input Channel 0 (A0)
  Actuators : SG92R Micro Servo
              PWM pin used Arduino Pin 9
              Airlift Shield RGB LEDs
 *********************************************************/

/*********LIBRARIES AND DEPENDENCIES *************/ 
#define USE_AIRLIFT
// Your my_secrets.h must contain WiFi and AIO access keys
// My secrets from AIO_MQTT_LED_Pot folder , modify as necessary
#include "C:\Users\thayer\Documents\ENGS28\AIO_MQTT_LED_Pot\AIO_MQTT_LED_Pot\my_secrets.h"

#include <SPI.h>
#include <WiFiNINA.h>
#include <Servo.h>

#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

#include <AdafruitIO_MQTT.h>
#include <AdafruitIO_Definitions.h>
#include <AdafruitIO_Feed.h>
#include <AdafruitIO_Time.h>
#include <AdafruitIO_WiFi.h>
#include <AdafruitIO.h>
#include <AdafruitIO_Group.h>
#include <AdafruitIO_Data.h>
#include <AdafruitIO_Dashboard.h>

// For AirLift Breakout/Wing/Shield: Configure the following to match the ESP32 Pins!
#if !defined(SPIWIFI_SS)
  #define SPIWIFI SPI
  #define SPIWIFI_SS 10  // for chip select
  #define SPIWIFI_ACK 7  // busy or ready pin for SPI bus
  #define ESP32_RESETN 5 // reset pin
  #define ESP32_GPIO0  -1 // not connected to any GPIO port
  #define SET_PINS  1    // set pins using this definition
#endif

 // define struct for displaying traffic control
 // RED_YELLOW_GREEN_YELLOW RED SEQUENCE
 // use BLUE for maintenance mode
 // Put red on when train arriving
 // Close gate for maintenance mode and train arrival
 // open gate on Maintenance clear and train clear for normal traffic flow to procede

 struct rgb_t {
  uint8_t red;
  uint8_t green;
  uint8_t blue; };

 rgb_t traffic_color = {0,0,0};


 const byte TempSensor =  A0;  // temperature sensor is connected to A0
 
/***IN CODE CONSTANTS***/
#define BAUD_RATE 115200    // baud rate for serial connection
#define GATE_OPEN 15        // open gate by rotating servo bar to about 15 degrees (keep clear off mech. limit)
#define GATE_CLOSE 165      // close gate to 165 degrees (keep clear off mech. limit)

#define PRESSED 49          // push down value from adafruit IO push button

#define TEMP_CONV_CONST  500
#define TEMP_SCALER      10
#define VDD              5128
#define MAX_ADC          1024

 /************************* WiFi Access Point *********************************/
#define WLAN_SSID       MY_WLAN_SSID
#define WLAN_PASS       MY_WLAN_PASS
int keyIndex = 0; // your network key Index number (needed only for WEP)
int status = WL_IDLE_STATUS;

/*********** Define states for Finite State Machine *********************/
enum State_enum {RED, YELLOW_1, GREEN, YELLOW_2, MAINTENANCE, TRAIN_ARRIVAL};

uint8_t state = RED;   // set RED state as initial state

uint8_t arrived = 0;   // keep track of if a train has arrived - used to handle pressing of push buttons

/************** signals for crossing ************************/
uint8_t maintenance_mode = 0;
uint8_t maintenance_clear = 0;
uint8_t train_arrive = 0;
uint8_t train_clear = 0;

/************************* Adafruit.io Setup *********************************/

#define AIO_SERVER        "io.adafruit.com"
#define AIO_SERVERPORT    8883         // Using port 8883 for MQTTS
// Adafruit IO Account Configuration
// (to obtain these values, visit https://io.adafruit.com and click on Active Key)
#define AIO_USERNAME      MY_AIO_USERNAME
#define AIO_KEY           MY_AIO_KEY

// AIO feed names
#define AIO_MC_FEED   "maintenance"       // feed for maintenance mode
#define AIO_TS_FEED   "train_sig"         // feed for train signals
#define AIO_TM_FEED   "temp_monitor"      // for temperature monitoring
#define AIO_TR_FEED   "temp_indicator"    // for temperature recording

// WiFISSLClient for SSL/TLS support
WiFiSSLClient client;

// setup client
// Setup the MQTT client class 
// by WLAN_PASSing in the WiFi client and MQTT server and login details.
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);
 
/************* Feeds and Subscriptions ***************************/
// set up subscription for monitoring low temperatures
// prompring remote operator to initiate maintenance mode and clearing it on good temperature
Adafruit_MQTT_Publish tempFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/f/" AIO_TM_FEED);

// set up subscription for recording traffic temperatute readings
// display on temperature read widget
Adafruit_MQTT_Publish tempRecFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/f/" AIO_TR_FEED);

// set up maintenance mode subscription called "MCswitch" for initiating and 
// terminating maintenance mode when temperature is too low (maybe too much snow)
Adafruit_MQTT_Subscribe MCswitch = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/f/" AIO_MC_FEED);

// now grab the initial value of the maintenance control widget
Adafruit_MQTT_Publish MCswitch_get = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/f/" AIO_MC_FEED "/get");

// set up subscribtion to train control switch
Adafruit_MQTT_Subscribe TSbutton = Adafruit_MQTT_Subscribe(&mqtt, AIO_USERNAME "/f/" AIO_TS_FEED);

// grab initial value
Adafruit_MQTT_Publish TSbutton_get = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/f/" AIO_TS_FEED "/get");

// set up servo
Servo gate;

void setup() {
  // put your setup code here, to run once:
  // set pin 9 as PWM output
  gate.attach(9);
  
  Serial.begin(BAUD_RATE);
  while (!Serial)
  {
    ; // wait for serial port to connect
    }
  #ifdef SET_PINS
    WiFi.setPins(SPIWIFI_SS, SPIWIFI_ACK, ESP32_RESETN, ESP32_GPIO0, &SPIWIFI);
  #endif

  // check for the wifi module
  while (WiFi.status() == WL_NO_MODULE)
  {
   Serial.println("Unable to communicate with WiFi module!"); 
   delay(1000);  // try again after 1 sec
   }

  String firmwareVer = WiFi.firmwareVersion();

  if (firmwareVer < "1.0.0"){
    Serial.println("Upgrade Firmware to Continue");
    }

  // attempt connection with WiFi network
  Serial.print("Attempting to connect to SSID: ");
  Serial.println(WLAN_SSID);

  // Connect to WPA/WPA2 network. Change this line if using open or WEP network:

  do{
    status = WiFi.begin(WLAN_SSID, WLAN_PASS);
    delay(100); // wait until connected
    } while (status != WL_CONNECTED);
    Serial.println("Connected to WiFi!");
    printWiFiStatus();

    // Setup MQTT subscription for Maintenance mode switch
    mqtt.subscribe(&MCswitch);

    mqtt.subscribe(&TSbutton);
    MQTT_connect();
    
    // Force a message on the MCswitch and TSbutton feed
    MCswitch_get.publish("\0");
    TSbutton_get.publish("\0");
}

void loop() {
  // put your main code here, to run repeatedly:
  
  update_state(); // update state when no subscription message is in
  // connect through MQTT to network
  MQTT_connect();

  // wait for subscription packet to arrive
  Adafruit_MQTT_Subscribe *subscription;
  while ((subscription = mqtt.readSubscription(5000))) {
    // check if Maintenance mode
    if (subscription == &MCswitch) {
      Serial.print(F("On-Off button: "));
      Serial.println((char *)MCswitch.lastread);

      if (strcmp((char *)MCswitch.lastread, "ON") == 0) {
        Serial.println("Maintenance Mode");
        // create signals for state update
        maintenance_mode = 1;    // assert maintenance mode signal
        maintenance_clear = 0;  // make sure maintenance clear is asserted as 0
        update_state(); // update state based of maintenance signal
        }
      
      else if (strcmp((char *)MCswitch.lastread, "OFF") == 0) {
        Serial.println("Maintenance Clear");
        maintenance_clear = 1;  // assert clear signal
        maintenance_mode = 0;   // clear maintenance mode signal
        update_state(); // update state based of maintenance signal   
        }
      }

      // check if Train Signal
      if (subscription == &TSbutton){
        Serial.print(F("Button value :"));
        Serial.println(TSbutton.lastread[0]);
        if (TSbutton.lastread[0] == PRESSED){
        if (arrived == 0){ // check if train is arriving or clear
          arrived = 1;  // arrival and clear variable
          train_arrive = 1;  // assert train arrival signal
          train_clear = 0;   // clear train clear signal
          }
        else if (arrived == 1){   // if train has already arrived and being clear
          arrived = 0; // update flag
          train_arrive = 0; // clear train arrive signal
          train_clear = 1;  // assert train clear signal
          }
        }
         update_state();  // update state based on train signal
        }     
    }

    // acquire and a publish
    uint32_t adc_value = analogRead(TempSensor);    // read from analog input for temperture sensor
    int32_t voltage = ( (int32_t)adc_value * VDD)/MAX_ADC;  // convert to voltage
    int32_t celcius = (voltage - TEMP_CONV_CONST)/TEMP_SCALER;   // convert from voltage to temperature (celcius)
    tempFeed.publish(celcius);             // publish to indicator feed
    tempRecFeed.publish(celcius);          // publish to gauge feed
}

void setLED( rgb_t traffic_color ) {
  WiFi.setLEDs( traffic_color.red, traffic_color.green, traffic_color.blue );
}

// Function to connect and reconnect as necessary to the MQTT server.
// Should be called in the loop function and it will take care if connecting.
void MQTT_connect()
{
  int8_t ret;
  if (mqtt.connected())
  {
    return;
    }

   Serial.print("COnnecting to MQTT... ");

   uint8_t retries = 3;

   while((ret = mqtt.connect()) != 0)
   {
    Serial.println(mqtt.connectErrorString(ret));
    Serial.println("Retrying MQTT connection in 5 seconds...");
    mqtt.disconnect();
    delay(5000);  // wait for 5 secs
    retries--;

    if (retries == 0)
    {
      // basically die and wait for Watch Dog Timer to reset
      while (1)
      ;
      
      }
    }
    Serial.println("MQTT Connected!");
  }

// Function to report status of the WiFi connection
void printWiFiStatus()
{
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI): ");
  Serial.print(rssi);
  Serial.println(" dBm");
  }

 void update_state()
 {
  switch(state)
  {
    case RED:
        // turn red LED on
        traffic_color.red = 250;
        traffic_color.green = 0;
        traffic_color.blue = 0;
        setLED(traffic_color);

        // check for signals and transition accordingly
        if (maintenance_mode){
          maintenance_mode = 0;
          state = MAINTENANCE;
          }
        else if (train_arrive){
          train_arrive = 0;
          state = TRAIN_ARRIVAL;
          }
        else
          state = YELLOW_1;   // to YELLOW_1 state if no signal received
       break;
     case YELLOW_1:
       // turn on yellow LED
       traffic_color.red = 250;
       traffic_color.green = 250;
       traffic_color.blue = 0;
       setLED(traffic_color);
       // check for signals and transition accordingly
        if (maintenance_mode){
          maintenance_mode = 0;
          state = MAINTENANCE;
          }
        else if (train_arrive){
          train_arrive = 0;
          state = TRAIN_ARRIVAL;
          }
        else
          state = GREEN;    //to GREEN state if no signal received   
       break;
     case GREEN:
        // turn on green LED
        traffic_color.red = 0;
        traffic_color.green = 250;
        traffic_color.blue = 0;
        setLED(traffic_color);
        // check for signals and transition accordingly
        if (maintenance_mode){
          maintenance_mode = 0;
          state = MAINTENANCE;
          }
        else if (train_arrive){
          train_arrive = 0;
          state = TRAIN_ARRIVAL;
          }
        else
          state = YELLOW_2; // to YELLOW_2 state if no signal received   
      break;
    case YELLOW_2:
        traffic_color.red = 250;
        traffic_color.green = 250;
        traffic_color.blue = 0;
        setLED(traffic_color);
        if (maintenance_mode){
          maintenance_mode = 0;
          state = MAINTENANCE;
          }
        else if (train_arrive){
          train_arrive = 0;
          state = TRAIN_ARRIVAL;
          }
        else
          state = RED;    // to RED state if no signal received
    break;
    case MAINTENANCE:
       gate.write(GATE_CLOSE);
       // turn on blue LED
       traffic_color.red = 0;
       traffic_color.green = 0;
       traffic_color.blue = 250;
       setLED(traffic_color);
       if (maintenance_clear){
        maintenance_clear = 0;
        gate.write(GATE_OPEN); // open gate
        state = RED;  // to RED state if maintenance mode is cleared
        }      
    break;
    case TRAIN_ARRIVAL:
      gate.write(GATE_CLOSE);    // close gate
      // turn on red LED
      traffic_color.red = 250;
      traffic_color.green = 0;
      traffic_color.blue = 0;
      setLED(traffic_color);      
      if (train_clear){
        train_clear = 0;
        gate.write(GATE_OPEN); // open gate
        state = RED; // to RED state train arrival signal is cleared
        }
    break;
    default:
    break; 
    }
  } 
