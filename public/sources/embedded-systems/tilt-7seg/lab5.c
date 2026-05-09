/* Test the device drivers for seven segment display
 * 
 * Name:			E.W. Hansen
 * Assignment:		Engs 85 21W
 *
 * Program name:	lab5.c
 * Date created:	13 Feb 2021
 *
 * Target device:	ATmega328p / Arduino UNO
 * Dependencies:	i2c.c, SevenSeg.c
 */

/* INCLUDE FILES */
#include <avr/io.h>					// All the port definitions are here
#include <util/delay.h>
#include <i2c.h>					// Williams' code
#include <SevenSeg.h>				// The new library
#include <lsm303agr.h>
#include <USARTE85.h>
#include <ioE85.h>
#include <math.h>
#include <avr/interrupt.h>
//#include <stdlib.h>

#define PI  3.142
#define COUNT 62500    // for 1 sec interrupts
void initTimerInterrupt(uint16_t bound);
/* CODE */
volatile uint8_t flag;   // check if it is time to interrupt

int main(void) {
	initTimerInterrupt(COUNT);
	flag = 0; 
	
  	i2cInit();
  	USART_Init();
  	SevenSeg_init();
    lsm303_AccelInit();
    
    lsm303AccelData_s accel;
	uint8_t who = lsm303_AccelRegisterRead(LSM303_WHO_AM_I_A);
	printf("WHO_AM_I_A is = %d\n\r", who);
	float tiltz;
	int16_t Ax; int16_t Ay; int16_t Az;
	uint16_t display_buffer[HT16K33_NBUF];
			
	while(1) {
		if (flag){
			flag = 0;
			lsm303_AccelReadRaw(&accel);
			Ax = accel.x; Ay = accel.y; Az = accel.z;
		printf("x_accel = %d\n\ry_accel = %d\n\rz_accel = %d\n\r",Ax,Ay,Az);
		float ratio = accel.x*0.001;
		if (ratio > 1)
			ratio = 1.0;
		if (ratio < -1)
			ratio = -1.0;
		tiltz = asin(ratio);
		int16_t degree = (int16_t)round(tiltz*1800/3.14);
		printf("degree : %d\n\n\r",degree/10);
		SevenSeg_angle(degree,display_buffer);
		SevenSeg_write(display_buffer);
		SevenSeg_dim(14);
		}
	}

	return 0;		/* never reached */
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