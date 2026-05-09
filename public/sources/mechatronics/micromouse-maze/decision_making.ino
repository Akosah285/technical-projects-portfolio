// Group 3
// ENGS 147
// Maze Navigation

#include "ArduinoMotorShieldR3.h"
#include "NAxisMotion.h"

#include <SPI.h>
#include <Wire.h>
#include <math.h>

// this is cell specific - maze exploring algo will map out where walls are ( it will be helpful if you can help with functions that check sensors for wall)
// for example - use sensors to check for walls
// based on direction, we can map the walls as we move through the maze
// we might also have to initialize every thing to false or use !true to detect openings
typedef struct cell{
  bool NORTH;
  bool SOUTH;
  bool EAST;
  bool WEST;
  bool visited;
} cell_t;

cell_t maze[8][8];


typedef struct x_y_position{ //position refers to cell coordinate
  uint8_t x;
  uint8_t y;
} position_t;

position_t curr_position = {0,0};


typedef struct x_y_distance{ //distance refers to x and y cm traveled
  float x;
  float y;
} distance_t;

distance_t curr_distance = {17.5,17.5};     //start a bit before center so that robot doesn't detect center right away
distance_t prev_distance = {-17.78,-17.78};
distance_t distance_traveled = {0,0};

// use to keep track of directions of micromouse (-Akwasi : added this to keep track of where car is facing)
const uint8_t UP = 0;
const uint8_t RIGHT = 1;
const uint8_t DOWN = 2; //IDEA: have up, right, down, left = 0,1,2,3, and the just +1 for right turn, -1 for left turn
const uint8_t LEFT = 3;

//use to keep track of turning direction
const uint8_t TURNING_RIGHT = 0;
const uint8_t MOVE_FORWARD = 1;
const uint8_t TURNING_LEFT = 2;
const uint8_t TURNING_BACKWARD = 3;


// for sensors
const uint8_t CENTER = 2; //LEFT and RIGHT already defined as 0 and 1
float distance_from_wall[3] = {0.0,0.0,0.0};

// encoder pins
int chipSelectPin1=10;
int chipSelectPin2=9;
int chipSelectPin3=8;

// distance analog sensors pins
int right_sensor_pin = A3;
int center_sensor_pin = A2;
int left_sensor_pin = A4;

// to update motion shield data
bool updateSensorData;

//const uint8_t LEFT = 0;               // use this for left motor
//const uint8_t RIGHT = 1;              // use this for right motor
//const uint8_t CENTER = 2;

// CONSTANTS
float COUNTSPERREV = 720; //counts per rev for the EV3encoder
float PWMmax = 400;
float Vmax = 9.6;
float CELLSIZE = 35.56;
float RADIUS = 3.04/2;

const uint8_t THRESHOLD = 50; // 50cm away from wall, bc if no wall, then next well should be at least 50cm away 

//FLAGS
bool start = true; //to indicate we are in the first center cell {0,0}
bool make_decision_flag = false;
bool front_wall_flag = false;

//FLAG FOR PRINT STATEMENTS
bool odometer_print_checks = false;
bool distance_controller_print_checks = false;
bool mapping_print_checks = false;


// GLOBAL VARIABLES
uint8_t curr_direction = UP;  // global direction
uint8_t turning_direction;    // direction of next turn
long init_encoder;            // make glabal because need access in odometry() and drive_straight_wall_following()

int i = 0;

// VARIABLES
ArduinoMotorShieldR3 md;
NAxisMotion mySensor;



void setup() 
{
  Serial.begin(115200);

  /*set up for Motor Shield */
  Serial.println();
  Serial.println();
  Serial.println("Arduino Motor Shield R3");
  md.init();

  /* set up infared sensor */
  Serial.println("Distance Sensor Config");
  pinMode(right_sensor_pin, INPUT);
  pinMode(center_sensor_pin, INPUT);
  pinMode(left_sensor_pin, INPUT);

  //Changes ADC resolution. Number represents the bit resolution; 8 bits = 0 to 255, 10 bits = 0 to 1024, 12 bits = 0 to 4096. 
  analogReadResolution(12); 
  
  /* set up for encoder */
  pinMode(chipSelectPin1, OUTPUT);
  pinMode(chipSelectPin2, OUTPUT);
  pinMode(chipSelectPin3, OUTPUT);
  
  digitalWrite(chipSelectPin1, HIGH);
  digitalWrite(chipSelectPin2, HIGH);
  digitalWrite(chipSelectPin3, HIGH);

  LS7366_Init();

  // setup NAxis Shield
  I2C.begin();                    //Initialize I2C communication to the let the library communicate with the sensor.
  // sensor initialization
  mySensor.initSensor(0x28);          //The I2C Address can be changed here inside this function in the library
  mySensor.setOperationMode(OPERATION_MODE_NDOF);   //Can be configured to other operation modes as desired
  mySensor.setUpdateMode(MANUAL);  //The default is AUTO. Changing to manual requires calling the relevant update functions prior to calling the read functions
  mySensor.updateAccelConfig();
  updateSensorData = true;

  init_encoder = getEncoderValue(1); //capture initial encoder position

  for(int i=0;i++;i<8){   //initialize cell_t maze[8][8] as false for all walls
    for(int j=0;j++;j<8){
        maze[i][j].NORTH = false;
        maze[i][j].SOUTH = false;
        maze[i][j].EAST = false;
        maze[i][j].WEST = false;
    }
  }
  delay(100); //to allow setup to finish

  full_stop();
  
}

/****************/
/* MAIN LOOP */
/****************/
void loop()
{

  /*
  while (i <= 1){
    mySensor.updateEuler();
    //TEST TURNING FUNCTIONS SEPARATELY
    turning(90.0);
    full_stop();
    i++;
    }
  i = 0;
  while (i <= 1){
    mySensor.updateEuler();
    //TEST TURNING FUNCTIONS SEPARATELY
    turning(-90.0);
    full_stop();
    i++;
    }
  */
  
  if(front_wall_flag) { //if obstacle within 30cm of center sensor...
    Serial.println("Front wall detected!");
    distance_controller(); //has second distance check
    //NOTE: if use error<1 condition to end controller, controller might end prematurely bc of sensor reading error
    front_wall_flag = false;
  }
  
  else if(make_decision_flag) { //if wall_following detects center of cell has been reached...
    Serial.println();
    Serial.println("--- CENTER OF CELL HIT ---");
    Serial.println();
    
    Serial.print("Odometer:");  //print odometer readings when center hit to check accuracy
    Serial.print("\t x distance = ");
    Serial.print(curr_distance.x);
    Serial.print(" \t y distance = ");
    Serial.println(curr_distance.y);
    
    if(start) {
      start = false; 
    }
    else {
      maze[curr_position.x][curr_position.y].visited = true;
      update_position();
      } //only update once we leave the {0,0} position, otherwise will prematurely update to {0,1}

    mark_walls(); //mark the walls for that cell  
    
    if(mapping_print_checks) {
      Serial.print("Cell position: {");
      Serial.print(curr_position.x);
      Serial.print(",");
      Serial.print(curr_position.y);
      Serial.print("}");
  
      Serial.print("\tNORTH: ");
      Serial.print(maze[curr_position.x][curr_position.y].NORTH);
      Serial.print("\tEAST: ");
      Serial.print(maze[curr_position.x][curr_position.y].EAST);
      Serial.print("\tSOUTH: ");
      Serial.print(maze[curr_position.x][curr_position.y].SOUTH);
      Serial.print("\tWEST: ");
      Serial.println(maze[curr_position.x][curr_position.y].WEST);
    }
    
    full_stop();
    
    turning_direction = choose_direction(); //based on walls of that cell, choose a direction to go
    Serial.print("Turning direction: ");
    Serial.println(turning_direction);
   
    update_direction(turning_direction); //update global direction variable
    Serial.print("New direction: ");
    Serial.println(curr_direction);
    Serial.println();
   
    switch(turning_direction) {
      case TURNING_RIGHT:
        turning(100.0); 
        full_stop(); 
        break;
      case TURNING_LEFT:
        turning(-100.0);
        full_stop();
        break;
      case MOVE_FORWARD:
        //no turning
        Serial.println("MOVE FORWARD");
        break;
      case TURNING_BACKWARD:
        turning(190.0);
        full_stop();
        break;
    }

    make_decision_flag = false; //reset flag
  }
  
  else {
    Serial.println("Driving straight!"); //should not print repeatedly as I drive straight
    //
    distance_from_wall[LEFT] = ADC_to_distance(analogRead(left_sensor_pin));
    distance_from_wall[RIGHT] = ADC_to_distance(analogRead(right_sensor_pin));
    Serial.print("First left ADC value read:");
    Serial.println(distance_from_wall[LEFT]);
    Serial.print("First right ADC value read:");
    Serial.println(distance_from_wall[RIGHT]);
    drive_straight_wall_follow();    //default command if no obstacles and no decisions to make (not in center of cell)
  }
  
  
     /* Mapping functions - do at end of every wall-following loop
     * 1.Use odometry function to get x and y coordinates in cm
     * 2.If distance%35.56cm = 0, then indicates center of cell
     *    -update_position() - updates cell coordinates from initial {0,0} value, with default curr_direction = UP
     *    -mark_wall() - see which sides have wall
     *    
     *    //do these within main_loop, not here!
     *    -choose_direction() - using position and wall info, choose direction 
     *    -update_direction() - once turning_direction is set, we can turn and update the robot direction
     *    -call turning() function - to actuate the direction change     
     */
}


/*
 * implement full stop (use between function calls to clear motor speed)
 */
void full_stop(){
  //Serial.println("--FULL STOP--");
  md.setM1Speed(0);
  md.setM2Speed(0); 
  delay(2000);
}




/* drive straight and wall following */
void drive_straight_wall_follow(){
  // compensator local variables
  float a = 0.949;
  float b = 0.351;
  long count = 0;
  
  long current_time;
  float vel[2] = {0,0};   // first element for left motor , second element for right motor
  long prev_encoder_value[2]  = {0,0};
  long curr_encoder_value[2] = {0,0};
  float error[2] = {0,0};
  float control_effort[2] = {0,0};
  int PWM_sig[2] = {0,0};
  float delta_v = 0.0;
  long encoder_counts[2] = {0,0};
  float prev_error[2] = {0.0,0.0};
  float prev_control_effort[2] = {0.0,0.0};
  float sensor_volt[3] = {0,0,0}; // to store right,center and left voltages
  //float distance_from_wall[3] = {0.00,0.00,0.00};
  unsigned long prev_time = 0;
  
  // wall following variables
  const float GAIN_DIST = 0.05;  //gain for wall folloowing
  float REFDIST = 16.0;         // 16 cm from the wall
  float REFVEL = 10.0;          // rad/s
  const uint16_t STREAMPERIOD = 40000;  //To stream at every 40ms intervals

  bool has_move_flag = false;
  bool follow_left = false;
  
  prev_encoder_value[LEFT] = getEncoderValue(2);
  prev_encoder_value[RIGHT] = getEncoderValue(1);


  //read sensro values
  //set right flag - true if right wall closer, false if left wall closer
  distance_from_wall[LEFT] += ADC_to_distance(analogRead(left_sensor_pin));
  distance_from_wall[RIGHT] += ADC_to_distance(analogRead(right_sensor_pin));

  Serial.print("After 2nd left ADC value read:");
  Serial.println(distance_from_wall[LEFT]);
  Serial.print("After 2nd right ADC value read:");
  Serial.println(distance_from_wall[RIGHT]);

  distance_from_wall[LEFT] = distance_from_wall[LEFT]/2;
  distance_from_wall[RIGHT] = distance_from_wall[RIGHT]/2;

  Serial.print("Avg. left ADC value read:");
  Serial.println(distance_from_wall[LEFT]);
  Serial.print("Avg. right ADC value read:");
  Serial.println(distance_from_wall[RIGHT]);
  
  prev_time = micros();

  
  while (!make_decision_flag && !front_wall_flag){ //when to exit the wall-following loop? - exit when hit center of cell!

    current_time = micros();

    if ((current_time - prev_time) >= STREAMPERIOD){
      count ++;


      /**** velocity control ***/
      curr_encoder_value[LEFT] = getEncoderValue(2);
      curr_encoder_value[RIGHT] = getEncoderValue(1);

      encoder_counts[LEFT] = curr_encoder_value[LEFT] - prev_encoder_value[LEFT];
      encoder_counts[RIGHT] = curr_encoder_value[RIGHT] - prev_encoder_value[RIGHT];

      vel[LEFT] = encoder_counts[LEFT]*1000000.0/STREAMPERIOD;
      vel[LEFT] = -1.0*vel[LEFT] * 2.0 * PI/COUNTSPERREV;
      
      vel[RIGHT] = encoder_counts[RIGHT]*1000000.0/STREAMPERIOD;
      vel[RIGHT] = -1.0*vel[RIGHT] * 2.0 * PI/COUNTSPERREV;
      
      // change in voltage for wall following  
      if(follow_left) { 
        delta_v = GAIN_DIST * (distance_from_wall[LEFT] - REFDIST); //corrects voltage to motors based on distance from right wall
      }
      else delta_v = GAIN_DIST * (distance_from_wall[RIGHT] - REFDIST); //corrects voltage to motors based on distance from right wall
      
      error[LEFT] =  (float)(REFVEL + delta_v) - (float)vel[LEFT];
      error[RIGHT] =   (float)(REFVEL - delta_v) - (float)vel[RIGHT];
      
      control_effort[LEFT] = prev_control_effort[LEFT] + a*error[LEFT] - b*prev_error[LEFT];
      control_effort[RIGHT] = prev_control_effort[RIGHT] + a*error[RIGHT] - b*prev_error[RIGHT];

      PWM_sig[LEFT] = control_effort_to_PWM(control_effort[LEFT]);
      PWM_sig[RIGHT] = control_effort_to_PWM(control_effort[RIGHT]);

      md.setM1Speed(PWM_sig[LEFT]);
      md.setM2Speed(PWM_sig[RIGHT]);

      // update previous values
      prev_encoder_value[LEFT] = curr_encoder_value[LEFT];
      prev_encoder_value[RIGHT] = curr_encoder_value[RIGHT];
      
      prev_control_effort[LEFT] = control_effort[LEFT];
      prev_control_effort[RIGHT] = control_effort[RIGHT];
      
      prev_error[LEFT] = error[LEFT];
      prev_error[RIGHT] = error[RIGHT];
      
      prev_time = current_time;
    }


    //MAPPING FUNCTIONS - should we put this into the 40ms loop? 

    odometer(); //update distance from start
    
    /* check if wall in front */
    distance_from_wall[CENTER] = ADC_to_distance(analogRead(center_sensor_pin));
    if(distance_controller_print_checks) {
      Serial.print("Distance from front: ");
      Serial.println(distance_from_wall[CENTER]);
    }
    if(distance_from_wall[CENTER] < 30) { //has 2nd distance check in distance_controller function
      front_wall_flag = true; //reset in main while loop
    }
    //else front_wall_flag = false;

    //track distance traveled since last center
    distance_traveled.y = curr_distance.y - prev_distance.y;
    distance_traveled.x = curr_distance.x - prev_distance.x;

    /* check if center of cell reached */
    if ( (distance_traveled.y >= 35.56) || (distance_traveled.x >= 35.56)  ) { // if reach "center of cell", leaves control loop
      //moved update position and mark walls to main while loop()
      prev_distance.y = curr_distance.y; //update prev_distance
      prev_distance.x = curr_distance.x;
      make_decision_flag = true;
    }

    //END OF MAPPING
    
  }
}

/*
 * ODOMETER: tracks x and y distances relative to starting location (in cm)
 */
bool odometer(void) { //WORKS FOR SURE

  //if(odometer_print_checks) Serial.print("Odometer: ");
  //bool has_moved_flag;
  
  //use GLOBAL VARIABLE to capture initial encoder value
  long curr_encoder,encoder_count;
  float distance;
  
  curr_encoder = getEncoderValue(1);
  //Serial.print("init encoder = ");
  //Serial.print(init_encoder);
  //Serial.print("\tcurr_encoder = ");
  //Serial.print(curr_encoder); 
  encoder_count = abs(curr_encoder - init_encoder);  //will always be positive (or neg) value if only move forwards
  //Serial.print("\tencoder count = ");
  //Serial.print(encoder_count);

  distance = (encoder_count*2*PI)/COUNTSPERREV * RADIUS;
  //Serial.println(distance);
 
  /* update curr_ distance global variable */
  switch (curr_direction){
    case UP:
      curr_distance.y += distance; 
    break;
    case DOWN:
      curr_distance.y -= distance; 
    break;
    case RIGHT:
      curr_distance.x += distance;
    break;
    case LEFT:
      curr_distance.x -= distance;
    break;
  } 
  
  init_encoder = curr_encoder; //must update init_encoder each time so that delta distance is accurate

  //if(odometer_print_checks) {
  //  Serial.print("\t x distance = ");
  //  Serial.print(curr_distance.x);
  //  Serial.print(" \t y distance = ");
  //  Serial.println(curr_distance.y);
  //}
}



/* distance controller function */
void distance_controller(void) {
  
  // To track time and encoder values
  int T = 10000; //use T = 10ms
  int initTime, currTime, prevTime, timeCount;
  //long initEncoder, currEncoder, prevEncoder, encoderCount;
  
  // To implement closed-lopp
  float distref = 15;    // reference distance from wall - 12cn led to too much overshoot to too small distances, so changed to 15cm
  float distADC, dist;   // measured distance
  float error;           // error signal
  float Vcontrol;        // control effort
  int PWMcontrol;        // PWM = f(Vcontrol)

  // To implement controller using difference equation (w/ T = 0.01)
  float a1,a2,b1,b2;
  a1 = 0.6012;
  a2 = -0.5988;
  b1 = 1;
  b2 = -1;

  // To store values into array
  int times[2000];        //microseconds
  float distances[2000];  //position (in rad)
  int distADCs[2000];
  //float vels[2000];        //measured velocity (rad/s)
  float errors[2000];     //error signal (V)
  float Vcontrols[2000];  //control signal (V)
  int PWMcontrols[2000];  //control signal (PWM command)

  int count = 1;  //in first loop of while, store initial values


  // for diff equation, need k-1 value for error and control, so set array[0] as all 0s and start data collection at array[1]
  times[0] = 0;
  distADCs[0] = 0;
  distances[0] = 0;
  //vels[0] = 0;
  errors[0] = 0;
  Vcontrols[0] = 0;
  PWMcontrols[0] = 0;

  // read initial time (at last possible moment)
  initTime = micros();  // need to set baseline for time stamps
  prevTime = initTime;  // need to track time passed

  dist = ADC_to_distance(analogRead(center_sensor_pin));     //maps ADC value to distance cm value

  if(dist < 30) {   // only activate distance controller when 30cm from wall
    Serial.println("--distance controller activated--");
 
    // THEN get into loops
    while( count<200 ) { //could use abs(error) < 1 condition instead
  
      currTime = micros();  //get new time stamp
  
      if(currTime - prevTime >= T) { //only update if sample time T has passed     
  
        /* Don't need any velocity calcs */
        //timeCount = currTime - prevTime;   // time diff (should always be 5ms)
        
        //read distance signal
        dist = ADC_to_distance(analogRead(center_sensor_pin));     //maps ADC value to distance cm value
  
        //calculate error signal
        error = distref - dist;
         
        //calculate control signal
        Vcontrol = (a1*error + a2*errors[count-1] - b2*Vcontrols[count-1]) / b1;
        
        if(Vcontrol > 9.6) {  // to limit control signal so that it doesn't surpass limit Vin = 9.6V
          Vcontrol = 9.6;
        }
        else if(Vcontrol < -9.6){
          Vcontrol = -9.6;
        }
        // make separate function
    
        PWMcontrol = -(int)(Vcontrol * (PWMmax/Vmax)); //multiply Vcontrol by 400/9.6, add (-) bc error < 0 as robot approaches distref
    
        //send to motor (do as soon as possible)
        md.setM1Speed(PWMcontrol);
        md.setM2Speed(PWMcontrol);
        
        //store into array - zeroth value must be value before t=0;
        times[count] = currTime - initTime - T; // add -T because need to zero initial time stamp
        distADCs[count] = distADC;
        distances[count] = dist;
        //vel[count] = vmeas;
        errors[count] = error;
        Vcontrols[count] = Vcontrol;
        PWMcontrols[count] = PWMcontrol;
  
        //update values
        prevTime = currTime;
        //prevEncoder = currEncoder;
        count++; //only update count when sample taken     
      }
    }
    Serial.println("--distance controller complete--");
  } 
  else {
    if(distance_controller_print_checks) Serial.println("-second distance check failed-"); 
  }


  //print data array - in MATLAB, find SS and time constant
  /*for(int j = 0; j < count; j++) {
    Serial.print(times[j]);
    Serial.print("\t");
    Serial.print(distADCs[j]);
    Serial.print("\t");
    Serial.print(distances[j]);
    Serial.print("\t");
    //Serial.print(vel[j]);
    //Serial.print("\t");
    Serial.print(errors[j]);
    Serial.print("\t");
    Serial.print(Vcontrols[j]);
    Serial.print("\t");
    Serial.println(PWMcontrols[j]);
  }
  */
}

/* 
 *  Turning controller - calls turning_right and turning_left functions
 */
void turning(float turning_ref_value){
  turning_ref_value = PI*(turning_ref_value /180.0);
  Serial.print("turning ref value");
  Serial.println(turning_ref_value);
  if(turning_ref_value == PI){
    Serial.println("TURNING BACKWARD ");
    turning_right(turning_ref_value);
  }
  else if(turning_ref_value > 0){
    Serial.println("TURNING RIGHT");
    turning_right(turning_ref_value);
  }
  else if( turning_ref_value < 0){
    Serial.println("TURNING LEFT");
    turning_left(turning_ref_value);
  }
  else{
    Serial.println("mistake turning_ref_value is 0");
  }
}
  

/* turning controller */
void turning_right(float turning_ref_value){
  int STREAMPERIOD = 40000;
  long current_time;
  long prev_time =  micros();
  float curr_heading;
  int count = 0;
  float start_heading = mySensor.readEulerHeading();
  if(start_heading > 180.0){
    start_heading = start_heading - 360;
  }
  float coef1 =  5.956;
  float coef2 =  5.867/coef1;
  float coef3 = 0.9704;
  float turning_control_effort;
  float turning_control_effort_prev = 0.0;
  float turning_error;
  float turning_error_prev = 0.0;

//  coef1 (z - coef2)
//    -------------
//     z - coef3
//
//    7.956 z - 7.867
//  ---------------
//      z - 0.9704
  
  while (count<=100){
      current_time = micros();
      
      if ((current_time - prev_time) >= STREAMPERIOD)
      {
        count++;
        // turning right
        
        curr_heading =  mySensor.readEulerHeading();
      //get position in comparison to starting value 
      float rel_position = (float) curr_heading - start_heading;
      if(rel_position < 0){
        //Serial.print(" rel_pos is less than 0 : ");
        //Serial.print(rel_position);
        rel_position = rel_position + 360.0;
      }
      rel_position = PI*(rel_position/180.0);
      
      /************error and effor control************/
      turning_error = (float)turning_ref_value - rel_position;
      bool is_turning_left = (turning_error < 0 || turning_error > turning_ref_value);
      
      if(is_turning_left){
        //Serial.println(" turning left");
        turning_error = turning_ref_value;
      }
      //float turning_control_effort = 0.125 * turning_error;
      turning_control_effort = coef3*turning_control_effort_prev  + coef1*turning_error - coef1*coef2*turning_error_prev; // lag compensator equation
      int turning_pwm = int(turning_control_effort*(400/9.6));
      if (turning_pwm < -400){
          turning_pwm = -400;
        }
        else if (turning_pwm > 400){
         turning_pwm  = 400;
        }
      md.setM1Speed(turning_pwm);
      md.setM2Speed(-turning_pwm);
    
        mySensor.updateEuler(); 

        /*
        Serial.print(" curr heading: ");
        Serial.print(curr_heading);
        
        Serial.print(" start heading: ");
        Serial.print(start_heading);
    
        Serial.print(" rel_value: ");
        Serial.print(rel_position);
        
        Serial.print(" turning error: ");
        Serial.print(turning_error);
        
        Serial.print(" control effort: ");
        Serial.print(turning_control_effort);
    
        Serial.print(" control effort: ");
        Serial.print(turning_control_effort);
    
        Serial.println();
       */
        prev_time = current_time;
        turning_error_prev = turning_error;
        turning_control_effort_prev = turning_control_effort;
    }
  }
}

void turning_left(float turning_ref_value){
  int STREAMPERIOD = 40000;
  long current_time;
  long prev_time =  micros();
  float curr_heading;
  int count = 0;
  float start_heading = mySensor.readEulerHeading();
  float coef1 = 5.956;
  float coef2 =  5.867/coef1;
  float coef3 = 0.9704;
  float turning_control_effort;
  float turning_control_effort_prev = 0.0;
  float turning_error;
  float turning_error_prev = 0.0;

//  coef1 (z - coef2)
//    -------------
//     z - coef3
//
//   5.956 z - 5.867
//  ---------------
//      z - 0.9704
  
  while (count<=100){
      current_time = micros();
      
      if ((current_time - prev_time) >= STREAMPERIOD)
      {
        count++;
        //turning left
          curr_heading =  mySensor.readEulerHeading();
    //    if(abs(curr_heading - 360.0) < 1.0){
    //      curr_heading = 360.0;
    //    }
    //    
      //get position in comparison to starting value 
      float rel_position = (float) curr_heading - start_heading;
      rel_position = PI*(rel_position/180.0);
      
      /************error and effor control************/
      turning_error = (float)turning_ref_value - rel_position;
      bool is_turning_right = (turning_error > 0 || turning_error < turning_ref_value);
      
      if(is_turning_right){
        //Serial.println(" turning right");
        turning_error = turning_ref_value;
      }
      //float turning_control_effort = 0.125 * turning_error;
      turning_control_effort = coef3*turning_control_effort_prev  + coef1*turning_error - coef1*coef2*turning_error_prev; // lag compensator equation
      int turning_pwm = int(turning_control_effort*(400/9.6));
      if (turning_pwm < -400){
          turning_pwm = -400;
        }
        else if (turning_pwm > 400){
         turning_pwm  = 400;
        }
      md.setM1Speed(turning_pwm);
      md.setM2Speed(-turning_pwm);
      
        
        mySensor.updateEuler(); 
        /*
        Serial.print(" curr heading: ");
        Serial.print(curr_heading);
        
        Serial.print(" start heading: ");
        Serial.print(start_heading);
    
        Serial.print(" rel_pos_value: ");
        Serial.print(rel_position);
        
        Serial.print(" turning error: ");
        Serial.print(turning_error);
        
        Serial.print(" control effort: ");
        Serial.print(turning_control_effort);
    
        Serial.print(" control effort: ");
        Serial.print(turning_control_effort);
    
        Serial.println();
        */
        prev_time = current_time;
        turning_error_prev = turning_error;
        turning_control_effort_prev = turning_control_effort;
    }
  }
}



/*
 * update_position()
 * Updates global variable global position 
 * Arguments: NONE
 * returns: NONE
 */
void update_position(void){
  switch (curr_direction){
    case UP:
      curr_position.y += 1; 
      break;
    case DOWN:
      curr_position.y -= 1;
      break;
    case RIGHT:
      curr_position.x += 1;
      break;
    case LEFT:
      curr_position.x -= 1;
      break;
    default:
      break;
   } 
 }

/*
 * mark_wall()
 * Mark if theres a wall to the right or left
 * Arguments: NONE
 * returns none
 */
void mark_walls(void){

  // read sensors and convert to distance
  distance_from_wall[LEFT] = ADC_to_distance(analogRead(left_sensor_pin));
  distance_from_wall[RIGHT] = ADC_to_distance(analogRead(right_sensor_pin));
  distance_from_wall[CENTER] = ADC_to_distance(analogRead(center_sensor_pin));

  if(mapping_print_checks) {
    Serial.print("Distance from left = ");
    Serial.print(distance_from_wall[LEFT]);
    Serial.print("\tDistance from center = ");
    Serial.print(distance_from_wall[CENTER]);
    Serial.print("\tDistance from right = ");
    Serial.println(distance_from_wall[RIGHT]);
  }

  // set to false as default in setup()
  switch (curr_direction){
    case UP:
      if (distance_from_wall[LEFT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].WEST = true;
      }
      if (distance_from_wall[RIGHT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].EAST = true;
      }
      if (distance_from_wall[CENTER] < THRESHOLD){
        maze[curr_position.x][curr_position.y].NORTH = true;
      }
      // add logic to block of dead ends
      break;
    case DOWN:
      if (distance_from_wall[LEFT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].EAST = true;
      }
      if (distance_from_wall[RIGHT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].WEST = true;
      }
      if (distance_from_wall[CENTER] < THRESHOLD){
        maze[curr_position.x][curr_position.y].SOUTH = true;
      }
      // add logic to block of dead ends    
      break;
    case RIGHT:
      if (distance_from_wall[LEFT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].NORTH = true;
      }
      if (distance_from_wall[RIGHT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].SOUTH = true;
      }
      if (distance_from_wall[CENTER] < THRESHOLD){
        maze[curr_position.x][curr_position.y].EAST = true;
      }
      // add logic to block of dead ends
      break;
    case LEFT:
      if (distance_from_wall[LEFT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].SOUTH = true;
      }
      if (distance_from_wall[RIGHT] < THRESHOLD){
        maze[curr_position.x][curr_position.y].NORTH = true;
      }
      if (distance_from_wall[CENTER] < THRESHOLD){
        maze[curr_position.x][curr_position.y].WEST = true;
      }
      // add logic to block of dead ends
      break;
    default:
      break;
  }
}


/*
 * choose_direction()
 * 
 * Makes a decision on where to go based on the algorithm
 * Arguments: NONE
 * return the direction to go
 */
uint8_t choose_direction(void){
  //go right if you can, else go straight, go left, turn backward as a last resort 
  switch (curr_direction){ // depending on the absolute position we need to check different walls
    case UP:
      if (!maze[curr_position.x][curr_position.y].EAST) { 
        return TURNING_RIGHT;
      }
      else if (!maze[curr_position.x][curr_position.y].NORTH) {
        return MOVE_FORWARD;
      }
      else if (!maze[curr_position.x][curr_position.y].WEST) {
        return TURNING_LEFT;
      }
      else return TURNING_BACKWARD;
      break;
    case RIGHT:
      if (!maze[curr_position.x][curr_position.y].SOUTH) { 
        return TURNING_RIGHT;
      }
      else if (!maze[curr_position.x][curr_position.y].EAST) {
        return MOVE_FORWARD;
      }
      else if (!maze[curr_position.x][curr_position.y].NORTH) {
        return TURNING_LEFT;
      }
      else return TURNING_BACKWARD;
      break;
    case DOWN:
      if (!maze[curr_position.x][curr_position.y].WEST) { 
        return TURNING_RIGHT;
      }
      else if (!maze[curr_position.x][curr_position.y].SOUTH) {
        return MOVE_FORWARD;
      }
      else if (!maze[curr_position.x][curr_position.y].EAST) {
        return TURNING_LEFT;
      }
      else return TURNING_BACKWARD;
      break;
    case LEFT:
      if (!maze[curr_position.x][curr_position.y].NORTH) { 
        return TURNING_RIGHT;
      }
      else if (!maze[curr_position.x][curr_position.y].WEST) {
        return MOVE_FORWARD;
      }
      else if (!maze[curr_position.x][curr_position.y].SOUTH) {
        return TURNING_LEFT;
      }
      else return TURNING_BACKWARD;
      break;
    default:
      break;
  }
}

/*
 * update_direction(uint8_t turning_direction)    
 * Keep track of Absolute position by updating global variable curr_direction
 * Arguments:
 *  turning _direction: which direction the car just turned
 *  returns: NONE
 */
void update_direction(uint8_t turning_direction){
  if(turning_direction == TURNING_RIGHT){
    switch(curr_direction){
      case UP:
        curr_direction = RIGHT;
      break;
      case DOWN:
        curr_direction = LEFT;
      break;
      case RIGHT:
        curr_direction = DOWN;
      break;
      case LEFT:
        curr_direction = UP;
      break;
      default:
      break;
    }
  }
  else if(turning_direction == TURNING_LEFT){
    switch(curr_direction){
      case UP:
        curr_direction = LEFT;
      break;
      case DOWN:
        curr_direction = RIGHT;
      break;
      case RIGHT:
        curr_direction = UP;
      break;
      case LEFT:
        curr_direction = DOWN;
      break;
      default:
      break;
    }
  }
  else if(turning_direction == TURNING_BACKWARD){
    switch(curr_direction){
      case UP:
        curr_direction = DOWN;
      break;
      case DOWN:
        curr_direction = UP;
      break;
      case RIGHT:
        curr_direction = LEFT;
      break;
      case LEFT:
        curr_direction = RIGHT;
      break;
      default:
      break;
    }
  }
}


/* KEEP BECAUSE STILL USEFUL FOR MEASURING FRONT SENSOR to determine when to activate distance controller
 * 
 * read_distance_from_wall()
 * runs a running avg reads distance from the left, right and center walls
 * 
 * Arguments: NONE
 * returns: NONE
 */
void read_distance_from_wall(){
  uint16_t running_avg_len = 20;
  //use loop to call running_avg_len times, store in array, average the array, use averaged value
  uint16_t left_sensor_sum = 0;
  uint16_t right_sensor_sum = 0;
  uint16_t center_sensor_sum = 0;
  for(int i = 0; i < running_avg_len; i++){  //PROBLEM: samples too fast, would need time delay
     //left_sensor_sum += analogRead(left_sensor_pin);
    // right_sensor_sum += analogRead(right_sensor_pin);
     center_sensor_sum += analogRead(center_sensor_pin);
  }
  //distance_from_wall[LEFT] = ADC_to_distance(left_sensor_sum / running_avg_len);
  //distance_from_wall[RIGHT] = ADC_to_distance(right_sensor_sum / running_avg_len);
  distance_from_wall[CENTER] = ADC_to_distance(center_sensor_sum / running_avg_len);
}




/* convert sensor ADC value to distance cm value */
float ADC_to_distance(uint16_t ADC_value) {
    float distance;
    distance = -2.61457358486576e-14*pow(ADC_value,5) + 2.02466491005906e-10*pow(ADC_value,4) - 6.18031156459131e-07*pow(ADC_value,3) + 0.000938368797743478*pow(ADC_value,2) - 0.727567425635459*pow(ADC_value,1) + 254.472925936866;
    return(distance);
}


int control_effort_to_PWM(float control_effort){
  int PWM_sig = 0;
  // use linear approximation
  PWM_sig = int(control_effort*(400/9.6));
  // bound PWM signals between -400 and 400
  if (PWM_sig > 400){
    PWM_sig = 400;
  }
  else if (PWM_sig < -400){
    PWM_sig = -400;
  }

  return PWM_sig;
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
