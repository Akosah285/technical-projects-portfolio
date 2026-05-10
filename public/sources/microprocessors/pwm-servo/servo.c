/*
 * servo.c
 *
 *  Created on: Jan 31, 2021
 *      Author: Akwasi Akosah
 */

#include <stdio.h>
#include "xtmrctr.h"
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */
#include "servo.h"

#define PWM_PERIOD  			1000000 //(TLR0 + 2)
#define TMRCTR_0                0
#define TMRCTR_1                1
#define OPTIONS					(XTC_PWM_ENABLE_OPTION | XTC_DOWN_COUNT_OPTION | XTC_EXT_COMPARE_OPTION)
#define LOW_DUTY_CYCLE          5.25
#define HIGH_DUTY_CYCLE			10.25
#define MID_POINT 				8
static XTmrCtr axi_timer;

/*
 * Initialize the servo, setting the duty cycle to 7.5%
 */
void servo_init(void){
	XTmrCtr_Initialize(&axi_timer, XPAR_AXI_TIMER_0_DEVICE_ID);

	XTmrCtr_SetOptions(&axi_timer,TMRCTR_0, OPTIONS);
	XTmrCtr_SetOptions(&axi_timer,TMRCTR_1, OPTIONS);

	servo_set(MID_POINT);

}

/*
 * Set the dutycycle of the servo
 */
void servo_set(double dutycycle){
	if (dutycycle >= LOW_DUTY_CYCLE && dutycycle <= HIGH_DUTY_CYCLE){
		u32 high_time = dutycycle * PWM_PERIOD/ 100;

		XTmrCtr_Stop(&axi_timer, TMRCTR_0);
		XTmrCtr_Stop(&axi_timer, TMRCTR_1);

		XTmrCtr_SetResetValue(&axi_timer, TMRCTR_0,PWM_PERIOD);
		XTmrCtr_SetResetValue(&axi_timer, TMRCTR_1,high_time);

		XTmrCtr_Start(&axi_timer, TMRCTR_0);
		XTmrCtr_Start(&axi_timer, TMRCTR_1);
	}
}


