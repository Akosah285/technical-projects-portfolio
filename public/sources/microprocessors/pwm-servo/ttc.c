/*
 * ttc.c
 *
 *  Created on: Jan 30, 2021
 *      Author: Akwasi Akosah
 */

#include <stdio.h>
#include "xttcps.h"
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */
#include "ttc.h"
#include "gic.h"
#include "led.h"

static XTtcPs timer_port;
XTtcPs_Config *config_ptr;
XInterval interval;
u8 prescaler;

static void (*saved_ttc_callback)(void);
//void timer_handler(void *devicep);
void timer_handler(void *devicep){
	XTtcPs *devp = (XTtcPs*)devicep;
	u32 status = XTtcPs_GetInterruptStatus(devp);
	saved_ttc_callback();
	XTtcPs_ClearInterruptStatus(devp, status);
}

/*
 * ttc_init -- initialize the ttc freqency and callback
 */
void ttc_init(u32 freq, void (*ttc_callback)(void)){
	saved_ttc_callback = ttc_callback;

	config_ptr = XTtcPs_LookupConfig(XPAR_XTTCPS_0_DEVICE_ID);
	XTtcPs_CfgInitialize(&timer_port,config_ptr, XPAR_XTTCPS_0_BASEADDR);
	XTtcPs_DisableInterrupts(&timer_port, XTTCPS_IXR_INTERVAL_MASK);

	gic_connect(XPAR_XTTCPS_0_INTR, timer_handler,  &timer_port);

	XTtcPs_CalcIntervalFromFreq(&timer_port, freq, &interval, &prescaler);
	XTtcPs_SetPrescaler(&timer_port, prescaler);
	XTtcPs_SetInterval(&timer_port, interval);
	XTtcPs_SetOptions(&timer_port, XTTCPS_OPTION_INTERVAL_MODE);

	XTtcPs_EnableInterrupts(&timer_port, XTTCPS_IXR_INTERVAL_MASK);
}

/*
 * ttc_start -- start the ttc
 */
void ttc_start(void){
	XTtcPs_Start(&timer_port);
}


/*
 * ttc_stop -- stop the ttc
 */
void ttc_stop(void){
	XTtcPs_Stop(&timer_port);
}

/*
 * ttc_close -- close down the ttc
 */
void ttc_close(void){
	XTtcPs_DisableInterrupts(&timer_port, XTTCPS_IXR_INTERVAL_MASK);
	gic_disconnect(XPAR_XTTCPS_0_INTR);
}
