/*
 * adc.c -- The ADC module implementation
 */

#include <stdio.h>
#include "xadcps.h"
#include "xparameters.h"  	/* constants used by the hardware */
#include "xil_types.h"		/* types used by xilinx */
#include "adc.h"

#define CHANNELS (XADCPS_SEQ_CH_TEMP | XADCPS_SEQ_CH_VCCINT | XADCPS_SEQ_CH_AUX14)
XAdcPs_Config * configADC_ptr;
XAdcPs ADCport;

u16 rawdata;

/*
 * initialize the adc module
 */
void adc_init(void){
	configADC_ptr = XAdcPs_LookupConfig(XPAR_XADCPS_0_DEVICE_ID);
	XAdcPs_CfgInitialize(&ADCport, configADC_ptr,XPAR_XADCPS_0_BASEADDR);
	XAdcPs_SelfTest(&ADCport);
	XAdcPs_SetSequencerMode(&ADCport, XADCPS_SEQ_MODE_SAFE);
	XAdcPs_SetAlarmEnables(&ADCport, 0); //XADCPS_INTX_ALL_MASK);
	XAdcPs_SetSeqChEnables(&ADCport, CHANNELS);
	XAdcPs_SetSequencerMode(&ADCport, XADCPS_SEQ_MODE_CONTINPASS);
}

/*
 * get the internal temperature in degree's centigrade
 */
float adc_get_temp(void){
	rawdata = XAdcPs_GetAdcData(&ADCport, XADCPS_CH_TEMP);
	return XAdcPs_RawToTemperature(rawdata);
}

/*
 * get the internal vcc voltage (should be ~1.0v)
 */
float adc_get_vccint(void){
	rawdata = XAdcPs_GetAdcData(&ADCport, XADCPS_CH_VCCINT);
	return XAdcPs_RawToVoltage(rawdata);
}

/*
 * get the **corrected** potentiometer voltage (should be between 0 and 1v)
 */
float adc_get_pot(void){
	rawdata = XAdcPs_GetAdcData(&ADCport, 30);
	return XAdcPs_RawToVoltage(rawdata);
}

