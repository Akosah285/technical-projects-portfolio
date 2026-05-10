/*
 * io.c -- switch and button module interface
 *
 */

#include <stdio.h>			/* printf for errors */
#include <stdbool.h>
#include <xgpio.h>		  	/* axi gpio */
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */

#include "gic.h"
#include "io.h"

#define CHANNEL1 1

XGpio btnport;	       /* btn GPIO port instance */
XGpio swport;	       /* btn GPIO port instance */
static u32 sw;
static u32 curr_sw = 0x0;
static u32 prev_sw = 0x0;

static void (*saved_callback)(u32 btn);
static void (*saved_sw_callback)(u32 btn);

void btn_handler(void *devicep) {
	/* coerce the generic pointer into a gpio */
	XGpio *dev = (XGpio*)devicep;
	u32 button;
	button = XGpio_DiscreteRead(dev, CHANNEL1);
	switch(button){
			case 0x1:
				saved_callback(0);
				break;
			case 0x2:
				saved_callback(1);
				break;
			case 0x4:
				saved_callback(2);
				break;
			case 0x8:
				saved_callback(3);
				break;
			default:
				break;
			}
	XGpio_InterruptClear(dev, XGPIO_IR_MASK);

}

/*
 * initialize the btns providing a callback
 */
void io_btn_init(void (*btn_callback)(u32 btn)){
	saved_callback = btn_callback;

	XGpio_Initialize(&btnport, XPAR_AXI_GPIO_1_DEVICE_ID);

	XGpio_InterruptGlobalDisable(&btnport);
	XGpio_InterruptDisable(&btnport,XGPIO_IR_MASK);

	XGpio_SetDataDirection(&btnport, CHANNEL1, XGPIO_IR_MASK);

	/* connect handler to the gic (c.f. gic.h) */
	gic_connect(XPAR_FABRIC_GPIO_1_VEC_ID, btn_handler,  &btnport);

	/* enable interrupts on channel (c.f. table 2.1) */
	XGpio_InterruptEnable(&btnport, XGPIO_IR_MASK);
	XGpio_InterruptGlobalEnable(&btnport);

}

/*
 * close the btns
 */
void io_btn_close(void){
	/* disconnect the interrupts */
	XGpio_InterruptDisable(&btnport,XGPIO_IR_MASK);

	/* close the gic */
	gic_disconnect(XPAR_FABRIC_GPIO_1_VEC_ID);
}


/*
 * initialize the switches providing a callback
 */
void io_sw_init(void (*sw_callback)(u32 sw)){
	saved_sw_callback = sw_callback;


	XGpio_Initialize(&swport, XPAR_AXI_GPIO_2_DEVICE_ID);

	XGpio_InterruptGlobalDisable(&swport);
	XGpio_InterruptDisable(&swport,XGPIO_IR_MASK);

	XGpio_SetDataDirection(&swport, CHANNEL1, XGPIO_IR_MASK);
	prev_sw = XGpio_DiscreteRead(&swport, CHANNEL1);
	/* connect handler to the gic (c.f. gic.h) */
	gic_connect(XPAR_FABRIC_GPIO_2_VEC_ID, sw_handler,  &swport);

	/* enable interrupts on channel (c.f. table 2.1) */
	XGpio_InterruptEnable(&swport, XGPIO_IR_MASK);
	XGpio_InterruptGlobalEnable(&swport);

}

/*
 * close the switches
 */
void io_sw_close(void){
	/* disconnect the interrupts */
	XGpio_InterruptDisable(&swport,XGPIO_IR_CH1_MASK);

	/* close the gic */
	gic_disconnect(XPAR_FABRIC_GPIO_2_VEC_ID);
}


void sw_handler(void *devicep){
	XGpio *dev = (XGpio*)devicep;
	if (XGpio_InterruptGetStatus(dev)){
		curr_sw = XGpio_DiscreteRead(dev, CHANNEL1);

		sw = (prev_sw ^ curr_sw);
		switch(sw){
				case 0x1:
					saved_sw_callback(0);
					break;
				case 0x2:
					saved_sw_callback(1);
					break;
				case 0x4:
					saved_sw_callback(2);
					break;
				case 0x8:
					saved_sw_callback(3);
					break;
				default:
					break;
				}
		prev_sw = curr_sw;
		XGpio_InterruptClear(&swport, XGPIO_IR_MASK);
	}
}
