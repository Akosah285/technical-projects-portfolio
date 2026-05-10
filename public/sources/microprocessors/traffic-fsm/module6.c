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
#include "wifi.h"

#define FREQUENCY ((u32)10)
#define LOW_DUTY_CYCLE          5.25
#define HIGH_DUTY_CYCLE			10.25

#define MAINTENANCE_MODE 0
#define MAINTENANCE_CLEAR 1
#define TRAIN_ARRIVAL	 2
#define TRAIN_CLEAR		 3

#define TCP_COUNT 100
#define TF_COUNT 30  // for 3 second intervals using a TTC with frequency of 10 Hz
#define CROSS_TIME 100
#define TC_BLUE 10

typedef enum {RED_STATE, YELLOW_1_STATE, GREEN_STATE, YELLOW_2_STATE, TF_PED_CROSS,
	BLUE_STATE_ON, BLUE_STATE_OFF,GATE_CLOSE, GATE_OPEN} traffic_state_t;
traffic_state_t traffic_flow_state;


traffic_state_t state = RED_STATE;

u16 tc_e = 0;
float pot;
double dutycycle = 7.5;
// signal definitions
u8 tc = 0;
u8 TC1 = 0;
u8 TC2 = 0;
u8 TC3 = 0;

bool done_tf = false;
// signals for transitions
u8 enable_ped_cross = 0;
u8 enable_transitions = 0;
u8 ped_clear = 0;
u8 maintenance_mode = 0;
u8 train_arrival = 0;
u8 button_pressed = 0;
u8 transition_blue = 0;
u8 manual_enable = 0;
u8 maintenance_clear = 1;
u8 train_clear = 1;

//
u8 gate_closed = 0;

int substation_mode = -1;
void update_traffic_flow(traffic_state_t traffic_flow_state);

float pot_to_duty(float pot);

void timer_callback(){
	//led_toggle(0);
	tc_e ++;
	if (tc == TF_COUNT){
		enable_transitions = 1;
		tc = 0;
		ttc_stop();
	}
	else{
		tc++;
	}

}
void timer1_callback(){
	//led_toggle(1);
	if (TC1 == TCP_COUNT){
		enable_ped_cross = 1;
		TC1 = 0;
		ttc1_stop();
	}
	else{
		TC1++;
	}
}

void timer2_callback(){
	//led_toggle(2);
	tc_e ++;
	if (TC2 == CROSS_TIME){
		ped_clear = 1;
		TC2 = 0;
		ttc2_stop();
	}
	else{
		TC2++;
	}
}

void timer3_callback(){
	tc_e ++;
	//led_toggle(3);
	if (TC3 == TC_BLUE){
		transition_blue = 1;
		TC3 = 0;
		ttc3_stop();
	}
	else
		TC3++;
}

void switch_callback(u32 sw){
	//led_toggle(sw);
	if (sw == 0){
		if (maintenance_clear){
			maintenance_clear = 0;
			maintenance_mode = 1;
			printf("MAINTENACE MODE\n");
			servo_set(LOW_DUTY_CYCLE);
		}
		else if (maintenance_mode){
			maintenance_mode = 0;
			maintenance_clear = 1;
			printf("MAINTENACE CLEAR\n");
		}

	}
	else if (sw == 1){
		if (train_clear){
			train_arrival = 1;
			train_clear = 0;
			printf("GATE CLOSED\n");
			servo_set(HIGH_DUTY_CYCLE);
		}
		else if (train_arrival){
			train_arrival = 0;
			train_clear = 1;
			printf("GATE OPENED\n");
			servo_set(LOW_DUTY_CYCLE);
		}
	}
	else if (sw == 3)
		done_tf = true;

}

void timer4_callback(){
	led_toggle(3);
	Uart_update(0,0);
	substation_mode = Uart_status();
	switch(substation_mode){
		case MAINTENANCE_MODE:
				maintenance_clear = 0;
				maintenance_mode = 1;
				printf("MAINTENACE MODE\n");
				servo_set(LOW_DUTY_CYCLE);
			break;
		case MAINTENANCE_CLEAR:
				maintenance_mode = 0;
				maintenance_clear = 1;
				printf("MAINTENACE CLEAR\n");
			break;
		case TRAIN_ARRIVAL:
				train_arrival = 1;
				train_clear = 0;
				printf("GATE CLOSED\n");
				servo_set(HIGH_DUTY_CYCLE);
			break;
		case TRAIN_CLEAR:
				train_arrival = 0;
				train_clear = 1;
				printf("GATE OPENED\n");
				servo_set(LOW_DUTY_CYCLE);
			break;
		default:
			break;
	}
}
void button_callback(u32 button){
	//led_toggle(button);
	if (button == 1 || button == 0)
		button_pressed = 1;
}


int main()
{
    init_platform();
    gic_init();
    ttc_init(FREQUENCY, timer_callback);
    ttc1_init(FREQUENCY, timer1_callback);
    ttc2_init(FREQUENCY, timer2_callback);
    ttc3_init(FREQUENCY, timer3_callback);
    ttc4_init(1, timer4_callback);
    servo_init();
    led_init();
    adc_init();
    Uart_init();
    io_btn_init(button_callback);
    io_sw_init(switch_callback);
    ttc_start();
    ttc1_start();
    ttc4_start();
    led_set(ALL,LED_OFF);

    while(!done_tf){
    	update_traffic_flow(state);
    }
    printf("\n[done]\n");

    ttc_stop();
    ttc_close();
    ttc1_stop();
    ttc1_close();
    ttc2_stop();
    ttc2_close();
    ttc3_stop();
    ttc3_close();
    ttc4_stop();
    ttc4_close();
    io_btn_close();
    io_sw_close();
    Uart_close();
    gic_close();
    cleanup_platform();

    led_set(ALL,LED_OFF);
    return 0;
}

void update_traffic_flow(traffic_state_t traffic_flow_state){
	switch (traffic_flow_state){
		case RED_STATE:
			ttc2_stop();
			ttc_start();
   			led_set(RED,LED_ON);
    		led_set(3,LED_OFF);
    		if (enable_transitions){
    			enable_transitions = 0;
    			state = YELLOW_1_STATE;
    		}
    		else if (enable_ped_cross && button_pressed){
    			button_pressed = 0;
    			enable_ped_cross = 0;
    			state = TF_PED_CROSS;
    		}
    		else if (maintenance_mode){
    			tc = 0; // reset count
    			TC1 = 0;
    			state = BLUE_STATE_ON;
    		}
    		else if (train_arrival){
    			state = GATE_CLOSE;
    		}
    		break;
		case YELLOW_1_STATE:
			ttc_start();
   			led_set(YELLOW,LED_ON);
    		led_set(3,LED_OFF);
    		if (enable_transitions){
    			enable_transitions = 0;
    			state = GREEN_STATE;
    		}
    		else if (maintenance_mode){
    			tc = 0;
    			TC1 = 0;
    			state = BLUE_STATE_ON;
    		}
    		else if (train_arrival){
    			state = GATE_CLOSE;
    		}
			break;
		case GREEN_STATE:
			ttc_start();
  			led_set(GREEN,LED_ON);
    		led_set(3,LED_OFF);
    		if (enable_transitions){
    			enable_transitions = 0;
    			state = YELLOW_2_STATE;
    		}
    		else if (maintenance_mode){
    			tc = 0;
    			TC1 = 0;
    			state = BLUE_STATE_ON;
    		}
    		else if (train_arrival){
    			state = GATE_CLOSE;
    		}
			break;
		case YELLOW_2_STATE:
			ttc_start();
  			led_set(YELLOW,LED_ON);
    		led_set(3,LED_OFF);
    		if (enable_transitions){
    			enable_transitions = 0;
    			state = RED_STATE;
    		}
    		else if (maintenance_mode){
    			tc = 0;
    			TC1 = 0;
    			state = BLUE_STATE_ON;
    		}
    		else if (train_arrival){
    			state = GATE_CLOSE;
    		}
			break;
		case TF_PED_CROSS:
			ttc2_start();
			ttc_stop();
			led_set(3,LED_ON);
			led_set(RED,LED_ON);
			if (ped_clear){
				ped_clear = 0;
				TC1 = 0;
				state = RED_STATE;
				ttc1_start();
			}
			break;
		case BLUE_STATE_ON:
			ttc_stop();
			ttc1_stop();
			ttc3_start();
			pot = adc_get_pot();
			dutycycle = pot_to_duty(pot);
			servo_set(dutycycle);
			led_set(BLUE,LED_ON);
			if (transition_blue){
				transition_blue = 0;
				state = BLUE_STATE_OFF;
			}
			else if (maintenance_clear){
				ttc1_stop();
				state = TF_PED_CROSS;
			}
			break;
		case BLUE_STATE_OFF:
			ttc3_start();
			led_set(BLUE,LED_OFF);
			if (transition_blue){
				transition_blue = 0;
				state = BLUE_STATE_ON;
			}
			else if (maintenance_clear){
				ttc1_stop();
				state = TF_PED_CROSS;
			}
			break;
		case GATE_CLOSE:
			ttc_stop();
			ttc1_stop();
			ttc3_stop();
			led_set(RED,LED_ON);
			led_set(3,LED_ON);
			//printf("GATE CLOSED\n");
			if (train_clear){
				state = GATE_OPEN;
			}
			else if (maintenance_mode){
				state = BLUE_STATE_ON;
			}
			break;
		case GATE_OPEN:
			ttc2_start();
			led_set(RED,LED_ON);
			led_set(3,LED_ON);
			if (train_arrival){
				state = GATE_CLOSE;
			}
			else if (maintenance_mode){
				state = BLUE_STATE_ON;
			}
			else if (ped_clear){
				ped_clear = 0;
				TC1 = 0;
				ttc1_start();
				state = RED_STATE;
			}
			break;
	}
}

float pot_to_duty(float pot){
	return ((5*pot/2.9) + 5.25);
}
