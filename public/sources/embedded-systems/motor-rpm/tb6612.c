/**************************************************************************
 * Implementation of tb6612.h
 * controller for DC motor
 * A.D. Akosah, 02.26.2020 ,Engs 85 21W
 */

 #include "tb6612.h"

 /**************************************************************************
 * Initialize DC motor control
 */
 void motor_init(void){
    DDRB |= (1 << DDB1);    // set PB1/OC1A to output (arduino pin 9) for PWM
    DDRB |= (1 << DDB2);    // output serves as input to IN1
    DDRB |= (1 << DDB3);    // output serves as input to IN2
                            // STBY always connected to HIGH
 }
 /**************************************************************************
 * Sets DC motor mode : FWD,REV,BRAKE
 */
 void motor_mode(uint8_t mode){
     switch(mode){
        case FWD:
            // fail safe ; break first
            PORTB |= (1 << PORTB2) | (1 << PORTB3);
            PORTB &= ~(1 << PORTB3);  // set IN2 as low for CW movement
            break;
        case REV:
            // fail safe; break first
            PORTB |= (1 << PORTB2) | (1 << PORTB3);
            PORTB &= ~(1 << PORTB2); // set IN1 as low for CVW movement
            break;
        case BRAKE:
            PORTB |= (1 << PORTB2) | (1 << PORTB3); // brake mode
            break;
        case STOP:
            PORTB &= ~(1 << PORTB2) & ~(1 << PORTB3); // stop mode
            break;
        default:
            PORTB |= (1 << PORTB2) | (1 << PORTB3); // defaults to break
            break;

     }
 }
/**************************************************************************
 * Sets DC motor speed using calculated PWM value
 */
 void motor_speed(uint16_t pwm_value){
     // set up to operate withing set boundaries
     if (pwm_value < MOTOR_MIN)
        pwm_value = MOTOR_MIN;
     else if (pwm_value > MOTOR_MAX)
        pwm_value = MOTOR_MAX;
     OCR1A = pwm_value;  // load OCR1A register with PWM value
 }