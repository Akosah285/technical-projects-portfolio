/* 
 * Name: Akwasi Akosah	
 * Assignment: LAB 1
 *
 * Program name: blinkySIM.c
 * Date created: 01/14/2021
 * Description: flash leds in a sequence, one at a time : 0,1,2,0,...
 *
 * Dependencies: (what other source files are required)
 *
 * I/O pins:  Using PORT D (bit 2,4,7)
 * 
 * Revisions: (use this to track the evolution of your program)
 *
 *
 */

/* INCLUDE FILES */
#include <avr/io.h>				// All the port definitions are here
#include <util/delay.h>

// If using UART
// #include "USARTE85.h"   		// UART initializations
// #include "ioE85.h"      		// tiny_printf as well as some reading

// If using interrupts
// #include <avr/interrupt.h>	


/* FUNCTIONS */
/* Declare user-defined functions here (unless you have put the declarations in
 * their own #include file) */ 
void blinkSEQ(void);

/* CONSTANTS */
/* #define your constants here */
#define LED_ON_TIME   100		/* milliseconds */
#define LED_OFF_TIME  250 - LED_ON_TIME

/* CODE */
int main(void)
{
  	// Setup code (run once) goes here:
  	DDRD |= (1 << DDB2);          // configure bit 5 as output on B port
  	DDRD |= (1 << DDB7);          // configure bit 7 as output on D port
  	DDRD |= (1 << DDB4);          // configure bit 4 as output on D port
	// sei();					// Global interrupt enable (if using)

	// Main code (runs in an infinite loop) goes here:
	while(1) {
		blinkSEQ();
	}

	return 0;		/* never reached */
}

/* Code for your user-defined functions go here, if not in their own source files. */
void blinkSEQ(void){
		PORTD |= (1 << PORTD2); // set led in bit 2 on
		_delay_ms(LED_ON_TIME);
		
		PORTD &= ~(1 << PORTD2); // set led in bit 2 off
		_delay_ms(LED_OFF_TIME);
		
		PORTD |= (1 << PORTD4); // set led in bit 4 on 
		_delay_ms(LED_OFF_TIME);
		
		PORTD &= ~(1 << PORTD4); // set led in bit 4 off
		_delay_ms(LED_OFF_TIME);
		
		PORTD |= (1 << PORTD7); // set led in bit 7 on
		_delay_ms(LED_ON_TIME);
		
		PORTD &= ~(1 << PORTD7); // set led in bit 7 off
		_delay_ms(LED_OFF_TIME);	
}