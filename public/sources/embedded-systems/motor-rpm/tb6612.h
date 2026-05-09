/* tb6612.h
 * Device driver for motor controller (TB6612) 
 * A.D. Akosah, Engs 28, 21W
 */

 /*
  * include libraries
  */
  #include <avr/io.h>

  /*
   * include constant definitions
   */
   #define FWD     0
   #define REV     1
   #define BRAKE   2
   #define STOP    3

   #define MOTOR_MIN   0       
   #define MOTOR_MAX   1250 
   #define DEAD_BAND   5     // dead band width for ADC


   /*
    * function prototypes
    */
    // function initializes the motor controller by
    // setting ports for PWM,IN1, IN2
    void motor_init(void);   

    // function to set the mode includes failsafe for FWD <-> REV
    // FWD, REV, BRAKE, STOP 
    void motor_mode(uint8_t mode);

    // function controls speed of moto; interacts with Timer1
    void motor_speed(uint16_t pwm_value);