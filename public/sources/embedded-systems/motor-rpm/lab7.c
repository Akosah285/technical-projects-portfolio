/* lab7.c -- Control a DC motor with a potentiometer and calculate RPM using speed sensor
 * A.D. Akosah, Engs 28 21W
 * 
 * Date created:	27 Feb 2021
 * Description:		Potentiometer --> ADC --> PWM --> DCmotor control
 *
 * Target device:	Arduino UNO / TB6612 DC Motor
 * Tool version:	AVR-GCC
 * Dependencies:	ADC.c, USARTE85.c, ioE85.c tb6612.c SevenSeg.c i2c.c
 *
 * Potentiometer:  	Analog channel 0 (A0)
 * speed sensor input: 
 * DC Motor PWM input:	PD9
 *
 */

#include <avr/io.h>				
#include <avr/interrupt.h>
#include <ADC.h>
#include <USARTE85.h>
#include <ioE85.h>
#include <tb6612.h>
#include <math.h>
#include <stdlib.h>	            
#include <avr/interrupt.h>
#include <SevenSeg.h>

/* CONSTANTS */
#define TIMER1_TOP	      1250        // 625 us 
#define MAXADC 			      1023		    // 10-bit converter	
#define MID_ADC           512         // Mid adc value to determine CW and CCW directions
#define TIMER0_TOP	      125		      // Update timer on 125Hz (ie on 8ms intervals)

#define BRIGHTNESS        14          // controls the brightness of RPM display on SevenSeg

/* FUNCTION DECLARATIONS */
void Timer0_init(uint8_t timeout);	  // Pings when it's time to update
void PWMtimer1_init(void);            // initialize timer to generate PWM
void pin_change_init(void);           // initializes pin change interrupts
int32_t configure_motor(uint16_t adc_value); // set mode for motor; FWD,BRAKE,REV return PMW value
void speed_sensor_init(void);         // set up speed sensor to record motor RPM

/* GLOBAL VARIABLES */
volatile uint8_t timerFlag = 0;		    // keep track of when to interrupt
volatile uint8_t pulse_flag = 0;      // keep track of when pulses arrive
volatile uint8_t falling_edge = 0;    // used to capture pin changes as a pulse ; count with rising edge
volatile uint8_t forward = 0;                // keep track of direction for RPM display

// Main program
int main(void) {
  int16_t adc_value = 0;              // initialize adc value to 0
  int32_t pwm_value = MOTOR_MIN;      // set pwm_value to 0 for not movement on start
  uint8_t flags = 0;                  // counts flags to calculate RPM after 1sec
  uint16_t pulses = 0;                // keep track of received pulses in a sec interval
  uint16_t RPM = 0;                   // initialize RPM
  uint16_t display_buffer[HT16K33_NBUF]; // buffer for displaying tilt
  
  /* initialize devices and enable global interrupts */
  USART_Init();    
  ADC_Init();
  ADC_setChannel(0);   // take analog input from channel 0
  motor_init();
  i2cInit();
  speed_sensor_init();
  SevenSeg_init();
  PWMtimer1_init(); 
  Timer0_init(TIMER0_TOP);
  pin_change_init(); // set up pin change interrupts
  sei();
  printf("Potentiometer-controlled DC motor\n\r");
  
  while(1) {
 	if(timerFlag==1) {
    timerFlag=0;					// Put the flag down
    flags ++;             // count flags received
    if (flags == TIMER0_TOP){  // compute RPM after a sec (after 125 flags of 125Hz timer)
          flags = 0;      // clear number of flags received
          RPM = 3 * pulses;
          // check for direction forward direction has positive RPM value and vice versa
          if(!forward){
            printf("Mode = FWD\n\r"); 
            RPM = -1*RPM;       // negative to indicate direction
          }
          printf("RPM = %d\n\r",RPM);
          pulses = 0;  // clear pulses received
      }

		adc_value = ADC_getValue();		            // adc value (0 to 1023)
    pwm_value = configure_motor(adc_value);   // set up moto mode and compute pwm value
    motor_speed(pwm_value);                   // set motor speed based on pwm value
    }
    // check for pulse flag and update pulses received
    if (pulse_flag==1){
      pulse_flag = 0; // put the flag down
      pulses++;       // update pulses
    }
    // display RPM 
    SevenSeg_RPM(RPM,display_buffer); // store display segments in the buffer
    SevenSeg_write(display_buffer); // write what is in buffer to display
    SevenSeg_dim(BRIGHTNESS);  // set brightness of display 0-15
	// Processor could sleep here
  }
  return 0;                            /* This line is never reached */
}

// PWM setup function
void PWMtimer1_init(void) {
  TCCR1A |= (1 << WGM11); 					// fast pwm, using ICR1 as TOP
  TCCR1B |= (1 << WGM12) | (1 << WGM13); 
  TCCR1B |= (0 << CS12) | (1 << CS11) | (0 << CS10); 					// Prescaler: use 8
  
  ICR1    = TIMER1_TOP; 					// TOP --> 1.6KHz PWM frequency
  TCCR1A |= (1 << COM1A1); 					// clear on compare match, set at bottom
  OCR1A   = MOTOR_MIN;    					// set it to minimum position initially 
}

// Set timer for approx 61Hz sampling rate, running wide-open.
// Faster than the PWM (50Hz), but it works.
void Timer0_init(uint8_t timeout) {
  TCCR0A |= (1 << WGM01);							// CTC mode
  TCCR0B |= (1 << CS02) | (1 << CS00);				// Set prescaler to 1024
  TIMSK0 |= (1 << OCIE0A);							// Output compare interrupt
  OCR0A   = timeout;								// Set the timeout value
}

// sets motor mode
// Maps ADC-> PMW and return pmw value
int32_t configure_motor(uint16_t adc_value){
    int32_t pwm = 0;
    if (adc_value >= (MID_ADC - DEAD_BAND) && adc_value <= (MID_ADC + DEAD_BAND)){
      motor_mode(BRAKE); // set mode to break
      }
    else if (adc_value >= (MID_ADC + DEAD_BAND)){
      motor_mode(FWD);    // assert forward direction
      forward = 1;        // keep track of direction
      pwm = ( (uint32_t) (MOTOR_MAX - MOTOR_MIN)*adc_value)/(MAXADC-MID_ADC)  - MOTOR_MAX;
      }
    else if (adc_value <= (MID_ADC - DEAD_BAND)){
      motor_mode(REV);     // assert reverse direction
      forward = 0;         // keep track of direction
      pwm = ( (int32_t) -1*(MOTOR_MAX - MOTOR_MIN)*adc_value)/(MAXADC-MID_ADC)  + MOTOR_MAX;
      }
    return pwm;
}

// initializes speed sensor on motor to allow computing motor RPM
void speed_sensor_init(void){
  DDRD &= ~(1 << DDB7);    // configure bit 7 on port D as input
  PORTD |= (1 << PORTD7);  // enable pull-ip resistors;
}

void pin_change_init(void){
  PCICR |= (1 << PCIE2);      // configure to interupt with port D
  PCMSK2 |= (1 << PD7);       // mask for interrupts only on D7
}

ISR(TIMER0_COMPA_vect) {				
  timerFlag = 1; 									// time for another sample
}

ISR(PCINT2_vect){
  if ((PIND & (1<<PIND7))==0){
    if (falling_edge == 0){  // only record pulses on rising edge
      pulse_flag = 1;
      falling_edge = 1;  // update edge
    }
  }
  else {
    falling_edge = 0;  // manually keep track of edge
  }
}

