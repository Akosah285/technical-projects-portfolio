/*
 * led.h -- led module interface
 *
 */
#pragma once

#include <stdio.h>
#include <stdbool.h>
#include <xgpio.h>		  	/* axi gpio */
#include <xgpiops.h>		/* processor gpio */
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */

#define OUTPUT 0x0							/* setting GPIO direction to output */
#define CHANNEL1 1							/* channel 1 of the GPIO port */

/* led states */
#define LED_ON true
#define LED_OFF false

/* led controlled through PS*/
#define LED_4 (0x1 << 7)

/* pin and output of PS */
#define PSOUTPUT_PIN 7
#define ENABLE_PIN 1      /* to enable output pin*/
#define DISABLE_PIN 0
#define PS_OUTPUT 0x1

/*color or leds*/
#define RED  0xFFFFFFFB
#define BLUE 0xFFFFFFFE
#define GREEN 0xFFFFFFFD
#define YELLOW (RED & GREEN)

#define ALL 0xFFFFFFFF	/* A value designating ALL leds */

/*
 * Initialize the led module
 */
void led_init(void);

/*
 * Set <led> to one of {LED_ON,LED_OFF,...}
 *
 * <led> is either ALL or a number >= 0
 * Does nothing if <led> is invalid
 */
void led_set(u32 led, bool tostate);

/*
 * Get the status of <led>
 *
 * <led> is a number >= 0
 * returns {LED_ON,LED_OFF,...}; LED_OFF if <led> is invalid
 */
bool led_get(u32 led);

/*
 * Toggle <led>
 *
 * <led> is a value >= 0
 * Does nothing if <led> is invalid
 */
void led_toggle(u32 led);
