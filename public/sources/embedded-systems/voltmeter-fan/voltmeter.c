/* Add your header here *
 * Akwasi Akosah
 * LAB 3
 * Temperature sensor/
/* Include the usual four .h files */

#include <avr/io.h>
#include <USARTE85.h>
#include <ioE85.h>
#include <util/delay.h>

// User defined functions
void ADC_Init(void);
// Initialize the ADC
uint16_t getADCvalue(void);

// Start a conversion, return the result
int main(void) {  
	uint16_t adc_value; 
	int16_t voltage, celcius, fahreinheit;
	const int16_t Vdd = 5128;   // 5128 mV	
	
	USART_Init();  
	ADC_Init(); 
	 
	printf("Testing ADC with a variable voltage source\n\r");  
	
	while (1) {
		// Get a sample from the ADC
		adc_value = getADCvalue();
		voltage = ( (int32_t)adc_value * Vdd)/1023;  // voltage in mV
		celcius = (voltage - 500)/10;       // convert voltage to celcius
		fahreinheit = 1.8 * celcius + 32;  // convert from celcius to Fahreinheit
		// Print through UART
		printf("ADCvalue = %d,\t voltage = %dmV,\t Celcius = %dC,\t Fahreinheit = %d F\r\n",
				adc_value, voltage, celcius, fahreinheit);
				
		// Time delay until next sample  
		_delay_ms(1000);
		}  
	return 0;
	}
	
	
void ADC_Init(void) {
	// Initialize the ADC  
	ADMUX |=  (1 << REFS0); 
	// use AVCC for reference voltage
	ADMUX |=  (0 << MUX0) | (0 << MUX1) | (0 << MUX2);      // select A0 as input pin
	// set prescaler to divide by 128 (slowest)   
	ADCSRA |= (1 << ADPS1) | (1 << ADPS2) | (1 << ADPS0);  
	ADCSRA |= (1 << ADEN); // enable ADC 
}
uint16_t getADCvalue(void) {
// Start conversion, wait for completion, return result
	ADCSRA |= (1 << ADSC);
	while ((ADCSRA & (1 << ADSC)) != 0){}
	return ADC;
}