/*
 * blinky.c -- working with Serial I/O and GPIO
 *
 * Assumes the LED's are connected to AXI_GPIO_0, on channel 1
 *
 * Terminal Settings:
 *  -Baud: 115200
 *  -Data bits: 8
 *  -Parity: no
 *  -Stop bits: 1
 */
#include <stdio.h>							/* printf(), getchar() */
#include "xil_types.h"					/* u32, u16 etc */
#include "platform.h"						/* ZYBOboard interface */
#include <xgpio.h>							/* Xilinx GPIO functions */
#include "xparameters.h"				/* constants used by the hardware */
#include <stdlib.h>
#include <strings.h>
#include <stdbool.h>
#include <xgpiops.h>
#include "led.h"
#include "xgpiops.h"



void toggle_led(u32 led);

int main() {
   XGpio port,port2;									/* GPIO port connected to the leds */

   init_platform();							/* initialize the hardware platform */

   led_init();
   //led_set(ALL,LED_ON);

   led_set(0,LED_OFF);
   led_set(4,LED_ON);
	 /* 
		* set stdin unbuffered, forcing getchar to return immediately when
		* a character is typed.
		*/
	 setvbuf(stdin,NULL,_IONBF,0);
	 
	 printf("[Hello]\n");
	 printf(">");
	 
	 char cha;
	 int i = 0; // keep track of characters entered
	 long int ci;
	 // bool led_on = false; // step 7

	 while (1)
	 {viv
		 bool is_number, q_pressed,red, green, blue, yellow;
		 char str[] = "";
		 char *ptr;
		 cha = getchar();


		 if ((int)(cha)!=13){
			 strncat(str, &cha, 1);
			 printf("%c",cha);
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
				 ci = strtol(str,&ptr,10);
			 }

		 }

		 else{
			 if(is_number && i==1){
				 if (ci >= 0 && ci <=3){
					 printf("\n[%ld]",ci);
					 toggle_led(ci);
				 }
			 }
			 else if (red && i ==1)
			 	led_set(RED,LED_ON);
			 else if (blue && i ==1)
			 		led_set(BLUE,LED_ON);
			 else if (green && i ==1)
				 	 led_set(GREEN,LED_ON);
			 else if (yellow && i ==1)
				 	 led_set(YELLOW,LED_ON);
			 else if (q_pressed && i==1)
			 	break;

			 printf("\n>");
			 i = 0;
			 q_pressed = false;
			 is_number = false;
			 red = false;
			 yellow = false;
			 blue = false;
			 green = false;
		 }

	 }

	led_set(0,LED_OFF);
	led_set(4,LED_OFF);
	printf("\n----end of program---\n");



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
