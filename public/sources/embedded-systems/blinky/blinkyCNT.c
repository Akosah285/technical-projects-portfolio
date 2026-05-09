/* 
 * Name: Akwasi Akosah	
 * Assignment: LAB 1
 *
 * Program name: blinkySIM.c
 * Date created: 01/14/2021
 * Description: a three bit counter, displaying the three bits with the three LEDS.
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
 void displayCount(int count);

/* CONSTANTS */
/* #define your constants here */
#define LED_ON_TIME   2000		/* milliseconds */
#define LED_OFF_TIME  4500 - LED_ON_TIME
#define TERMINAL_COUNT 7
#define ALL_ON         0xFF
#define ALL_OFF        0x0
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
		for (int count = 0; count < TERMINAL_COUNT; count++){
			displayCount(count);   // display count in 3 bits
		}
	}

	return 0;		/* never reached */
}

/* Code for your user-defined functions go here, if not in their own source files. */
/* function to display counts in 3 bits
* takes the count as argument and toggle or switch bits accordingly
*/
void displayCount(int count){
	switch(count)
			{
				case 0:
					PORTD &= ALL_OFF;         // start from 000
					_delay_ms(LED_OFF_TIME);
					break;
				case 1:
					PORTD |= (1 << PORTD2);   // push 1 into least significant bit B2 in D
					_delay_ms(LED_ON_TIME);
					break;
				case 2:
					PORTD &= ~(1 << PORTD2);  // turn off least significant bit
					PORTD |= (1 << PORTD4);   // turn on bit 1
					_delay_ms(LED_ON_TIME);
					break;
				case 3:
					PORTD ^= (1 << PORTD2);  // toggle bit 0 on (011) from (010)
					_delay_ms(LED_ON_TIME);
					break;
				case 4:
					PORTD = ~(PORTD);        // invert (011) to (100)
					_delay_ms(LED_ON_TIME);
					break;
				case 5:
					PORTD |= (1 << PORTD2);  // push 1 into least significant bit (101)
					_delay_ms(LED_ON_TIME);
					break;
				case 6:
					PORTD |= (1 << PORTD4);  // toggle bit 1 on
					PORTD &= ~(1 << PORTD2); // turn least significant bit off
					_delay_ms(LED_ON_TIME);
				case 7:
					PORTD = ALL_ON;          // display all (111)
					_delay_ms(LED_ON_TIME);
				default:
					PORTD &= ALL_OFF;         // if weird input , turn all off
					_delay_ms(LED_OFF_TIME);
			}
}