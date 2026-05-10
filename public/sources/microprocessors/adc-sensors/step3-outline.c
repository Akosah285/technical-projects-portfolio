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

#include "gic.h"		/* interrupt cont0roller interface */
#include "xgpio.h"		/* axi gpio interface */
#include "led.h"
#include "io.h"
#include "xttcps.h"
#include "ttc.h"
#include "xtmrctr.h"
#include "servo.h"
#include "xadcps.h"
#include "adc.h"

#define FREQUENCY ((u32)1)
#define LOW_DUTY_CYCLE          5.25
#define HIGH_DUTY_CYCLE			10.25

float temperature ,voltage,pot;

/* hidden private state */
bool is_number; bool q_pressed; bool red; bool green; bool blue; bool yellow;
bool a_pressed; bool s_pressed; bool high; bool low;

int i = 0;
char cha;
double dutycycle = 7.5;
char str[] = "";
long int number;

/*
 * controll is passed to this function when a button is pushed
 *
 * devicep -- ptr to the device that caused the interrupt
 */
void toggle_led(u32 led);
void reset_states(void);
void update_states(void);
float pot_to_duty(float pot);

void button_callback(u32 button){
	led_toggle(button);

	if (button == 0){
		temperature = adc_get_temp();
		printf("[Temp = %.2f c]\n>",temperature);
	}
	else if (button ==1){
		voltage = adc_get_vccint();
		printf("[VccInt = %.2f v]\n>",voltage);
	}
	else if (button == 2){
		pot = adc_get_pot();
		printf("[Pot = %.2f v]\n>",pot);
	}
	else if (button == 3){
		pot = adc_get_pot();
		dutycycle = pot_to_duty(pot);
		printf("[%2f]\n>",dutycycle);
		servo_set(dutycycle);
	}

}

void timer_callback(){
	led_toggle(4);
}

int main() {
  init_platform();
  adc_init();
  gic_init();
  /*
   * initialize AXI timer counter*/

  ttc_init(FREQUENCY, timer_callback);
  servo_init();
  led_init();
  io_btn_init(button_callback);
  io_sw_init(button_callback);
  ttc_start();

  printf("[hello]\n>"); /* so we are know its alive */
  while(1){
	  cha = getchar();
	  printf("%c",cha);
	  	  		 // keep track of entered characters
	  if ((int)(cha)!=13){
	  	  strncat(str, &cha, 1);
	  	  i++;
	  	  update_states();
	  	  	}

	  	 else{
	  		printf("\n>");
	  		memset(str,0,sizeof(str));
	  	  	if(is_number && i==1){
	  	  		if (number >= 0 && number <=3)
	  	  			toggle_led(number);
	  	  		}
	  	  	else if ((a_pressed || s_pressed) && i == 1){
	  	  	  	  		printf("[%lf]\n>",dutycycle);
	  	  	  	  		servo_set(dutycycle);
	  	  	  	  	}
	  	    else if ((low || high)){
	  	    	servo_set(dutycycle);
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

	  	  reset_states();

	    }

  } /* do nothing and handle interrups */
  led_set(ALL,LED_OFF);


  printf("\n[done]\n");

  /* disconnect the interrupts (c.f. gic.h) */

  /* close the gic (c.f. gic.h)*/
  /* disconnect the interrupts */
  io_btn_close();
  io_sw_close();
  ttc_stop();
  ttc_close();
  gic_close();
  cleanup_platform();					/* cleanup the hardware platform */
  return 0;
}

void toggle_led(u32 led){
	led_toggle(led);
		if (led_get(led))
			printf("[%ld]\n[%ld on]\n",led,led);
		else
			printf("\n[%ld off]\n",led);
}

void reset_states(void){
	i = 0;
	q_pressed = false;
	is_number = false;
	red = false;
	blue = false;
	green = false;
	yellow = false;
	a_pressed = false;
	s_pressed = false;
	high = false;
	low = false;
}
void update_states(void){
	char *ptr;
	if (strcmp(str,"q")==0)
		  		  q_pressed = true;
		  	  else if (strcmp(str,"a")==0){
		  		  a_pressed = true;
		  		  dutycycle += 0.25;
		  	  }
		  	  else if (strcmp(str,"s")==0){
		  		s_pressed = true;
		  		dutycycle -= 0.25;
		  	  }
		  	  else if (strcmp(str,"high")==0){
		  		 high = true;
		  		 dutycycle = HIGH_DUTY_CYCLE;
		  	  }
		  	  else if (strcmp(str,"low")==0){
		  		  low = true;
		  		  dutycycle = LOW_DUTY_CYCLE;
		  	  }
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

float pot_to_duty(float pot){
	return ((5*pot/2.9) + 5.25);
}
