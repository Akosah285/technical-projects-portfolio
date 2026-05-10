/*
 * main.c -- A program to print a dot each time button 0 is pressed.
 *
 *  Some useful values:
 *  -- XPAR_AXI_GPIO_1_DEVICE_ID -- xparameters.h
 *  -- XPAR_FABRIC_GPIO_1_VEC_ID -- xparameters.h
 *  -- XGPIO_IR_CH1_MASK         -- xgpio_l.h (included by xgpio.h)
 */
#include <stdio.h>		/* getchar,printf */
#include <stdlib.h>		/* strtod */
#include <stdbool.h>		/* type bool */
#include <unistd.h>		/* sleep */
#include <string.h>

#include "platform.h"		/* ZYBO board interface */
#include "xil_types.h"		/* u32, s32 etc */
#include "xparameters.h"	/* constants used by hardware */

#include "gic.h"		/* interrupt controller interface */
#include "xgpio.h"		/* axi gpio interface */
#include "led.h"
#include "io.h"

#define CHANNEL1 1
/* hidden private state */
//static XGpio btnport;	       /* btn GPIO port instance */
	       /* variable used to count interrupts */
int pushes = 0;
/*
 * controll is passed to this function when a button is pushed
 *
 * devicep -- ptr to the device that caused the interrupt
 */
void toggle_led(u32 led);

void button_callback(u32 button){
	led_toggle(button);
	pushes ++;
}


int main() {

  init_platform();
  led_init();
  gic_init();
  io_btn_init(button_callback);
  io_sw_init(button_callback);

  //led_set(ALL,LED_OFF);
  led_set(4,LED_ON);

  int i = 0;
  char cha;

  printf("[hello]\n>"); /* so we are know its alive */
  while(1){
	  bool is_number, q_pressed, red, green, blue, yellow;
	  char str[] = "";
	  char *ptr;
	  cha = getchar();
	  long int number;
	  	  		 // keep track of entered characters
	  if ((int)(cha)!=13){
	  	  strncat(str, &cha, 1);
	  	  i++;
	  	  if (strcmp(str,"q")==0)
	  		  q_pressed = true;
	  	  else if (strcmp(str,"r")==0)
	  		  red = true;
	  	  else if (strcmp(str,"b")==0)
	  		  blue = true;
	  	  else if (strcmp(str,"g")==0)
	  		  green = true;
	  	  else if (strcmp(str,"y")==0)
	  		  yellow = true;
	  	  else if (isdigit(cha)){
	  	  		is_number = true;
	  	  		number = strtol(str,&ptr,10);
	  	  		}
	  	  	}
	  	 else{
	  	  	if(is_number && i==1){
	  	  		if (number >= 0 && number <=3)
	  	  			led_toggle(number);
	  	  		}
	  	  	else if (red && i ==1)
	  	  		led_set(RED,LED_ON);
	  	  	else if (blue && i == 1)
	  	  		led_set(BLUE,LED_ON);
	  	  	else if (green && i == 1)
	  	  		led_set(GREEN,LED_ON);
	  	  	else if (yellow && i== 1)
	  	  		led_set(YELLOW,LED_ON);
	  	  	else if (q_pressed && i==1)
	  	  		break;
	  	  	i = 0;
	  	  	q_pressed = false;
	  	  	is_number = false;
	  	  	red = false;
	  	  	blue = false;
	  	  	green = false;
	  	  	yellow = false;
	    }

  } /* do nothing and handle interrups */
  led_set(0,LED_OFF);
  led_set(4,LED_OFF);
  led_set(ALL,LED_OFF);
  printf("\n[done]\n");

  /* disconnect the interrupts (c.f. gic.h) */

  /* close the gic (c.f. gic.h)*/
  /* disconnect the interrupts */
  io_btn_close();
  io_sw_close();
  gic_close();
  cleanup_platform();					/* cleanup the hardware platform */
  return 0;
}

void toggle_led(u32 led){
	led_toggle(led);
		if (led_get(led))
			printf("\n[%ld on]",led);
		else
			printf("\n[%ld off]",led);
}
