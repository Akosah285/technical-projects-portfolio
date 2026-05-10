/*
 * led.h -- led module interface
 *
 */

#include <stdio.h>
#include <stdbool.h>
#include <xgpio.h>		  	/* axi gpio */
#include <xgpiops.h>		/* processor gpio */
#include <stdlib.h>
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */

/*include additional headers*/
#include "led.h"


XGpio port,port2;
XGpioPs psPort;
static XGpioPs_Config *config;
static u32 curr_state;

/*
 * Initialize the led module
 */
void led_init(void){
	XGpio_Initialize(&port, XPAR_AXI_GPIO_0_DEVICE_ID);
	XGpio_SetDataDirection(&port, CHANNEL1, OUTPUT);

	/* initialize PS GPIOs*/
	config = XGpioPs_LookupConfig(XPAR_XGPIOPS_0_DEVICE_ID);
	XGpioPs_CfgInitialize(&psPort, config,XPAR_PS7_GPIO_0_BASEADDR);
	XGpioPs_SetDirectionPin(&psPort, PSOUTPUT_PIN, 0x1);
	XGpioPs_SetOutputEnablePin(&psPort, PSOUTPUT_PIN, ENABLE_PIN);

	/* add colored LEDS */
	XGpio_Initialize(&port2, XPAR_AXI_GPIO_1_DEVICE_ID);
	XGpio_SetDataDirection(&port2, CHANNEL1, OUTPUT);
}

/*
 * Set <led> to one of {LED_ON,LED_OFF,...}
 *
 * <led> is either ALL or a number >= 0
 * Does nothing if <led> is invalid
 */
void led_set(u32 led, bool tostate){
	curr_state = XGpio_DiscreteRead(&port, CHANNEL1);

	if (tostate){
		if (led == ALL)
			XGpio_DiscreteWrite(&port, CHANNEL1, ALL);
		else{
			if (led == 4)
				XGpioPs_Write(&psPort, XPAR_PS7_SD_0_MIO_BANK, LED_4);
			else{
				XGpio_DiscreteWrite(&port, CHANNEL1, curr_state | (0x1 << led));
				XGpio_DiscreteWrite(&port2, CHANNEL1, ~led);
			}
		}
	}
	else{
		if (led == ALL)
			XGpio_DiscreteWrite(&port, CHANNEL1, ~(ALL));
		else{
			if (led == 4)
				XGpioPs_Write(&psPort, XPAR_PS7_SD_0_MIO_BANK, 0);
			else
				XGpio_DiscreteWrite(&port, CHANNEL1, curr_state &(~(0x1 << led)));
		}
	}
}

/*
 * Get the status of <led>
 *
 * <led> is a number >= 0
 * returns {LED_ON,LED_OFF,...}; LED_OFF if <led> is invalid
 */
bool led_get(u32 led){
	if (led < 0 || led > ALL)
		return LED_OFF;
	led = (0x1 << led);
	curr_state = XGpio_DiscreteRead(&port, CHANNEL1);
	u32 result = curr_state & led;
	if (result == led)
		return LED_ON;
	else
		return LED_OFF;
}

void led_toggle(u32 led){
	led = (0x1 << led);
	curr_state = XGpio_DiscreteRead(&port, CHANNEL1);
	XGpio_DiscreteWrite(&port, CHANNEL1, curr_state ^ led);

}
