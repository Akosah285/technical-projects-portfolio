/*
* adc.c -- ADC module implementation
*/

#include <avr/io.h>
#include "adc.h"

#define VREF  1      // set 1 for 1.1 ref volt; 5 for 5 ref volt
#define CHANNEL 0    // select between A0- A5
/*
* set the ADC input (0 - 5)
*/
void ADC_setChannel(uint8_t channel){
	if (channel >= 0 && channel <=5){
		ADMUX |= channel;
	}
}

/*
* set the ADC voltage reference
*/
void ADC_setReference(uint8_t Vref){
	if (Vref == 1){
		ADMUX |= (1 << REFS0) | (1 << REFS1);
	}
	else if (Vref == 5){
		ADMUX &= ~(1 << REFS1);
		ADMUX |= (1 << REFS0);
	}
}

/*
* Initialize the ADC
*/
void ADC_Init(void){
	ADC_setReference(VREF); // set reference voltage
	ADC_setChannel(CHANNEL); // set channel to sample from
	ADCSRA |= (1 << ADPS1) | (1 << ADPS2) | (1 << ADPS0); // use 128 prescaler 
	ADCSRA |= (1 << ADEN); // enable ADC 
}

/*
* Initiate conversion,return results
*/
uint16_t ADC_getValue(void){
	// Start conversion, wait for completion, return result
	ADCSRA |= (1 << ADSC);
	while ((ADCSRA & (1 << ADSC)) != 0){}
	return ADC;
}