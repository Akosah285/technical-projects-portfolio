/* Add your header here *
 * Akwasi Akosah
 * LAB 4
 * Temperature sensor with Fan
 * Include the usual four .h files */

#include <avr/io.h>
#include <USARTE85.h>
#include <ioE85.h>
#include <avr/interrupt.h>
#include "adc.h"

#define HIGH 28
#define LOW  26
#define COUNT 62500    // for 1 sec interrupts

// function to initialize interrupts
void initTimerInterrupt(uint16_t bound);
 
volatile uint8_t flag;   // check if it is time to interrupt

int main(void) { 
	initTimerInterrupt(COUNT);
	flag = 0; 
	uint16_t adc_value; 
	int16_t voltage, celcius, fahreinheit;
	const int16_t Vdd = 1100;   // 5128 mV
	
	DDRB |= (1 << DDB0) | (1 << DDB1) | (1 << DDB2); // enable pin B0 - B2 for output
	
	USART_Init();  
	ADC_Init();
	//initTimerInterrupt(uint16_t bound);
	printf("Testing ADC with a variable voltage source\n\r");  
	
	while (1) {
		if(flag){
			flag = 0;  // reset flag
			adc_value = ADC_getValue(); // get ADC sample
			voltage = ( (int32_t)adc_value * Vdd)/1024;  // voltage in mV
			celcius = (voltage - 500)/10;       // convert voltage to celcius
			fahreinheit = 1.8 * celcius + 32;  // convert from celcius to Fahreinheit
			// Print through UART
			printf("ADCvalue = %d,\t voltage = %dmV,\t Celcius = %dC,\t Fahreinheit = %d F\r\n",
				adc_value, voltage, celcius, fahreinheit);
			
			// turn on green light if temp equal or below threshold
			if (celcius <= LOW){
				PORTB |= (1 << PORTB1);  // turn on green light
				PORTB &= ~(1 << PORTB0); // turn of red light
				PORTB &= ~(1 << PORTB2); // turn off fan
			}
			// is temperature at or above high threshold?
			else if (celcius >= HIGH){
				PORTB |= (1 << PORTB0);  // turn on red light
				PORTB &= ~(1 << PORTB1); // turn off green light
				PORTB |= (1 << PORTB2);  // turn on fan
			}
		}			
		}  
	return 0;
	}

void initTimerInterrupt(uint16_t bound){
	TCCR1B |= (1 << WGM12); // set mode
	TIMSK1 |= (1 << OCIE1A); // enable timer interrupts
	OCR1A = bound; // load to count register
	TCCR1B |= (1 << CS12); // set pre scaler
	sei(); // enable global interrupts
}

ISR(TIMER1_COMPA_vect){
	flag = 1; // notify its time to sample
}