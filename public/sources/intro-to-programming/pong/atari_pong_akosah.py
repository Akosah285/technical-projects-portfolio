from cs1lib import *


# State variables


WINDOW_HEIGHT = 400
WINDOW_WIDTH = 400
PADDLE_WIDTH = 20
PADDLE_HEIGHT = 80

# start edge of left pad

x1 = 0
y1 = 0

# start edge of right pad
x2 = 380
y2 = 320

# speed of moving paddles in pixels
SPEED = 10

# Initial state of key variables

pressed_a = False
pressed_z = False
pressed_k = False
pressed_m = False


# draw pong pads and background

def paddles():


    disable_stroke()
    set_fill_color(0.5, 0, 0)  # dark brown
    draw_rectangle(x1, y1, PADDLE_WIDTH, PADDLE_HEIGHT)  # draws left paddle
    draw_rectangle(x2, y2, PADDLE_WIDTH, PADDLE_HEIGHT)  # draws right paddle


# update state variables on key press

def pressed(key):

    global pressed_a, pressed_k, pressed_m, pressed_z

    if key == "a":
        pressed_a = True
    elif key == "z":
        pressed_z = True
    elif key == "k":
        pressed_k = True
    elif key == "m":
        pressed_m = True


# update state variables on key release

def released(key):
    global pressed_a, pressed_z, pressed_k, pressed_m

    if key == "a":
        pressed_a = False
    elif key == "z":
        pressed_z = False
    elif key == "k":
        pressed_k = False
    elif key == "m":
        pressed_m = False


# Graphics function when keys are pressed

def make_game():
    global x1, y1, x2, y2

    set_clear_color(0.12, 1, 0.12)  # set background color green
    clear()   # clears background
    paddles()


    if pressed_a and y1 > 0:
        y1 = y1 - SPEED
    elif pressed_z and y1 < WINDOW_HEIGHT - 80:
        y1 = y1 + SPEED
    elif pressed_k and y2 > 0:
        y2 = y2 - SPEED
    elif pressed_m and y2 < WINDOW_HEIGHT - 80:
        y2 = y2 + SPEED


# start animation

start_graphics(make_game, title="PONG", framerate=50, width=WINDOW_WIDTH, height=WINDOW_HEIGHT, key_press=pressed,
               key_release=released)
