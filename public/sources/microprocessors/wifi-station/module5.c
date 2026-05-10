//#include <stdio.h>		/* getchar,printf */
#include <stdlib.h>		/* strtod */
#include <stdbool.h>		/* type bool */
#include <unistd.h>		/* sleep */
#include <string.h>
#include <unistd.h>

#include "platform.h"		/* ZYBO board interface */
#include "xil_types.h"		/* u32, s32 etc */
#include "xparameters.h"	/* constants used by hardware */

#include "xuartps.h"
#include "gic.h"
#include "io.h"
#include "led.h"

#include "xtmrctr.h"
#include "servo.h"
#include "xadcps.h"
#include "adc.h"

#define CONFIGURE 0
#define PING 1
#define UPDATE 2

#define BAUD_RATE ((u32)9600)
#define FIFO_THRESHOLD 		((u8)1)

#define ID 1
#define LOW_DUTY_CYCLE          5.25
#define HIGH_DUTY_CYCLE			10.25
#define POT_MAX					2.88

typedef struct{
	int type;
	int id;
}ping_t;

typedef struct{
	int type;
	int id;
	int value;
} update_request_t;

typedef struct{
	int type;
	int id;
	int average;
	int values[30];
} update_response_t;


XUartPs_Config *uartConfigPtr_1;
XUartPs UartPS1;
XUartPs_Config *uartConfigPtr_0;
XUartPs UartPS0;

u8 recvBuffer[100000];
u8 updateRecvBuf[100000];

u8 *p1;
// send in button handler
// receive in interrupt handler
bool done = false;
u8 mode = 0;  // default is in configure mode
int size = 0;
int idx = 0;
char *ptr;
static ping_t ping_msg;
static ping_t *p;



static update_request_t update_rq;
static update_request_t *update_rq_ptr;

char updateValueBuffer[2000];

float pot;
double duty_cycle;

void toggle_led(u32 led);
float percent_to_duty(int percent);
int pot_to_percent(float pot);

void button_callback(u32 button){
	led_set(ALL, LED_OFF);
	led_set(button, LED_ON);
	switch(button){
		case 0:
			mode = CONFIGURE;
			printf("<allows entry to wifi cmd mode>\r\n");
			break;
		case 1:
			mode = PING;
			p = &ping_msg;
			p->type = PING;
			p->id = ID;
			XUartPs_Send(&UartPS0,(u8*)p,sizeof(ping_t));
			printf("[PING]\n");
			break;
		case 2:
			mode = UPDATE;
			update_rq_ptr = &update_rq;
			update_rq_ptr->type = UPDATE;
			update_rq_ptr->id = ID;
			pot = adc_get_pot();
			update_rq_ptr->value = pot_to_percent(pot);
			XUartPs_Send(&UartPS0,(u8*)update_rq_ptr,sizeof(update_request_t));
			printf("[UPDATE]\n");
			break;
		case 3:
			done = true;
			break;
		default:
			mode = CONFIGURE;
			break;
	}
}

void UART1_handler(void *CallBackRef, u32 Event,unsigned int EventData){
	u8 byte;
	XUartPs *dev = (XUartPs*)CallBackRef;
	if (Event == XUARTPS_EVENT_RECV_DATA){
		switch(mode){
			case CONFIGURE:
				XUartPs_Recv(dev,&byte, 1);
				XUartPs_Send(&UartPS0,&byte,1);
				if (byte == '\r'){
					byte = '\n';
					XUartPs_Send(dev,&byte,1);
				}
				break;
		}

	}
}

void UART0_handler(void *CallBackRef, u32 Event,unsigned int EventData){
	u8 byte;
	ping_t *ptr_array;
	update_response_t* rps_array;
	XUartPs *dev = (XUartPs*)CallBackRef;
	if (Event == XUARTPS_EVENT_RECV_DATA){
		switch(mode){
			case CONFIGURE:
				XUartPs_Recv(dev,&byte, 1);
				XUartPs_Send(&UartPS1,&byte,1);
				break;
			case PING:
				XUartPs_Recv(dev,&byte, 1);
				recvBuffer[size] = byte;
				size++;
				if(size==sizeof(ping_t)){
					ptr_array = (ping_t*) recvBuffer;
					printf("[PING, id=%d]\n",ptr_array->id);
					size = 0;
				}
				break;
			case UPDATE:
				XUartPs_Recv(dev,&byte, 1);
				updateRecvBuf[size] = byte;
				size++;
				if(size==sizeof(update_response_t)){
					rps_array = (update_response_t*)updateRecvBuf;
					printf("[UPDATE, id=%d, average=%d,",rps_array->id,rps_array->average);
					printf("{");
					for (int i=0; i<30;i++){
						printf(" %d",rps_array->values [i]);
					}
					printf("}]\n");
					size = 0;
					duty_cycle = percent_to_duty(rps_array->values [rps_array->id]);
					servo_set(duty_cycle);
					memset(&updateRecvBuf,0,sizeof(u8));

				}
				break;
		}

	}
}

int main(void){
	/* do some initialization here*/
	init_platform();
	led_init();
	gic_init();
	adc_init();
	servo_init();
	io_btn_init(button_callback);

	uartConfigPtr_1 = XUartPs_LookupConfig(XPAR_PS7_UART_1_DEVICE_ID);
	XUartPs_CfgInitialize(&UartPS1, uartConfigPtr_1, uartConfigPtr_1->BaseAddress);
	XUartPs_SetFifoThreshold(&UartPS1, FIFO_THRESHOLD);
	XUartPs_SetInterruptMask(&UartPS1, XUARTPS_IXR_RXOVR);
	XUartPs_SetHandler(&UartPS1, (XUartPs_Handler)UART1_handler , &UartPS1);
	gic_connect(XPAR_XUARTPS_1_INTR, (Xil_InterruptHandler)XUartPs_InterruptHandler,  &UartPS1);

	uartConfigPtr_0 = XUartPs_LookupConfig(XPAR_PS7_UART_0_DEVICE_ID);
	XUartPs_CfgInitialize(&UartPS0, uartConfigPtr_0, uartConfigPtr_0->BaseAddress);
	XUartPs_SetBaudRate(&UartPS0, BAUD_RATE);
	XUartPs_SetFifoThreshold(&UartPS0, FIFO_THRESHOLD);
	XUartPs_SetInterruptMask(&UartPS0, XUARTPS_IXR_RXOVR);
	XUartPs_SetHandler(&UartPS0, (XUartPs_Handler)UART0_handler , &UartPS0);
	gic_connect(XPAR_XUARTPS_0_INTR, (Xil_InterruptHandler)XUartPs_InterruptHandler,  &UartPS0);




	printf("[Hello]\n");
	while(!done)
		sleep(1);
	printf("[done]\n");
	sleep(1);
	/* do some cleanup here */
	io_btn_close();
	io_sw_close();
	XUartPs_DisableUart(&UartPS1);
	gic_disconnect(XPAR_XUARTPS_1_INTR);
	XUartPs_DisableUart(&UartPS0);
	gic_disconnect(XPAR_XUARTPS_0_INTR);
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

float percent_to_duty(int percent){
	// convert to pot
	float pot = percent*2.9/100;
	return ((5*pot/2.9) + 5.25);
}

int pot_to_percent(float pot){
	return (int)(pot*100/2.88);
}
