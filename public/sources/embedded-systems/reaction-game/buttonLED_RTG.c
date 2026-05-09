/* ButtonLED_RTG
 * Implements a reaction-time game with two buttons
 */

#include <avr/io.h>			// All the port definitions are here (DDRB, PORTB)
#include <util/delay.h>

/*  FUNCTION DECLARATIONS*/
void led_count_down(void);
void winner_flick(int bit);

/* CONSTANTS */
#define LED_ON_TIME   100		/* milliseconds */
#define LED_OFF_TIME  1000       /* for a second */
#define TC_COUNTDOWN  3          /* for count down for 3 seconds */
#define FLICKER_COUNT 10         /* flicker to show winner */

int main(void)
{
	uint8_t state = 0;
  	// Setup code (run once) goes here
  	DDRD &= ~((1 << DDD7) | (1 << DDD4));			// configure bit 4 and 7 as INPUT
  	PORTD |= ((1 << PORTD7) | (1 << PORTD4));       // enable pull up resistors 
	
	// set up pin B0,B1 and B2 as OUTPUT
	DDRB |= ((1 << DDB0) | (1 << DDB1) | (1 << DDB2));
	
	// Main code (runs repeatedly) goes here
	while(1) {
	  switch (state){
	  	case 0:
	  		// turn on start led light
	  		PORTB |= (1 << PORTB1);
	  		// start count down to game when either buttons are pressed
	  		if ((PIND & (1 << PIND7)) == 0 || (PIND & (1 << PIND4)) == 0){
	  			state = 1; // change status to count down mode
	  		} 
	  		break;
	  	case 1:
	  		led_count_down(); // count down and keep light on after count down
	  		state = 2; // update state to in-progress state
	  		break;
	  	case 2:
	  		if ((PIND & (1 << PIND4)) == 0){
	  			winner_flick(PORTB2);  // flick button 2 as winner
	  			state = 0;   // go to initial state
	  		}
	  		if ((PIND & (1 << PIND7)) == 0){
	  			winner_flick(PORTB0);  // flick button 1 as winner
				state = 0;  // go to initial state
			}
	  		break;
	  	default:
	  		state = 0;   // go to initial state if default
	  		break;
	  }
	}
	return 0;		/* never reached */
}


/*  FUNCTION IMPLEMENTATIONS */
/* counts down to start of game by blinking start led
 * return : none
 * params : none
 */
void led_count_down(void){
	for (int count = 0; count < TC_COUNTDOWN; count ++){
		PORTB |= (1 << PORTB1);
		_delay_ms(LED_ON_TIME);
		
		PORTB &= ~(1 << PORTB1);
		_delay_ms(LED_OFF_TIME);
	}
	PORTB |= (1 << PORTB1);
}

/* flickers winner LED 
 * return : none
 * params : bit of LED to light
 */
void winner_flick(int bit){
	PORTB &= ~(1 << PORTB1);
	for (int count = 0; count < FLICKER_COUNT; count ++){
		PORTB |= (1 << bit);
		_delay_ms(LED_ON_TIME);
		
		PORTB &= ~(1 << bit);
		_delay_ms(LED_ON_TIME);
	}
	PORTB &= ~(1 << bit);
}