# file name : pong_game_Akosah.py
# author    : Akwasi Akosah
# date      : September 2018
# description : program creates a pong game animation

from cs1lib import *

# States Variables

WINDOW_HEIGHT = 400
WINDOW_WIDTH = 400
PADDLE_WIDTH = 20
PADDLE_HEIGHT = 80
PADDLE_SPEED = 10
TENNIS_SPEED_X = 5
TENNIS_SPEED_Y = 4

# Edge of left paddle

X1 = 0
Y1 = 0

# Edge of right paddle

X2 = 380
Y2 = 320

# Position of ball at start of game and radius

BX = 200
BY = 200
RADIUS_OF_TENNIS = 7


# Initial state of events

pressed_a = False
pressed_z = False
pressed_k = False
pressed_m = False
space_press = False
game_in_progress = False
game_over = False





# keypress events

def press(key):

    global pressed_a, pressed_k, pressed_m, pressed_z, space_press

    if key == "a":
        pressed_a = True
    elif key == "z":
        pressed_z = True
    elif key == "k":
        pressed_k = True
    elif key == "m":
        pressed_m = True
    elif key == " ":
        space_press = True
    elif key == "q":
        cs1_quit()


# Updates state variables on key release

def release(key):
    global pressed_a, pressed_z, pressed_k, pressed_m, space_press

    if key == "a":
        pressed_a = False
    elif key == "z":
        pressed_z = False
    elif key == "k":
        pressed_k = False
    elif key == "m":
        pressed_m = False
    elif key == " ":
        space_press = False


# draw paddles

def paddles():
    disable_stroke()

    set_fill_color(0.8, 0.8, 0.8)  # a tint of white
    draw_rectangle(X1, Y1, PADDLE_WIDTH, PADDLE_HEIGHT)  # draws left paddle

    set_fill_color(0.6, 0.6, 0.6)  # dark grey
    draw_rectangle(X2, Y2, PADDLE_WIDTH, PADDLE_HEIGHT)  # draws right paddle


def draw_tennis():

    set_fill_color(0, 1, 0)   # light green
    draw_circle(BX, BY, RADIUS_OF_TENNIS)  # draws tennis ball

# draws game background

def court():

    clear()
    set_clear_color(0, 0, 0.3)  # dark blue


# function defines how paddles move on keypress events

def paddle_movements():
    global X1, X2, Y1, Y2, pressed_a, pressed_z, pressed_k, pressed_m, space_press, PADDLE_SPEED

    if pressed_a and Y1 > 0:
        Y1 = Y1 - PADDLE_SPEED  # moves left paddle up

    elif pressed_z and Y1 < WINDOW_HEIGHT - PADDLE_HEIGHT:
        Y1 = Y1 + PADDLE_SPEED  # moves left paddle down

    elif pressed_k and Y2 > 0:
        Y2 = Y2 - PADDLE_SPEED  # moves right paddle up

    elif pressed_m and Y2 < WINDOW_HEIGHT - PADDLE_HEIGHT:
        Y2 = Y2 + PADDLE_SPEED  # moves right paddle down


# Displays text for user to start new game

def game_over_text():

    if game_over:
        enable_stroke()
        set_clear_color(0.3, 0.4, 0)  # sets background to a shade of green

        set_stroke_color(1, 1, 0)  # yellow
        set_font_size(20)   # Increase font size
        draw_text("GAME OVER !", 140, 150)

        set_stroke_color(0, 0, 0)  # black
        set_font_size(14) # Increase font size
        draw_text("Press Space To Start New Game", 120, 300)


# Defines ball movement under different constraints

def ball_movement():

    global BX, BY, RADIUS_OF_TENNIS, TENNIS_SPEED_Y, space_press, WINDOW_HEIGHT, TENNIS_SPEED_X, WINDOW_WIDTH, \
        game_in_progress, game_over



    if space_press:

        game_in_progress = True
        game_over = False


    if game_in_progress:

        BY = BY + TENNIS_SPEED_Y  # increase ball speed in y- direction
        BX = BX + TENNIS_SPEED_X  # increase ball speed in x- direction

    # reverses ball speed on contact with the vertical wall

    if BY >= WINDOW_HEIGHT - RADIUS_OF_TENNIS or BY <= RADIUS_OF_TENNIS:

        TENNIS_SPEED_Y = -TENNIS_SPEED_Y  # reverses ball speed in y- direction

    # reverses ball speed on contact with left paddle

    if BX >= WINDOW_WIDTH - RADIUS_OF_TENNIS - PADDLE_WIDTH and Y2 < BY < Y2 + PADDLE_HEIGHT:

        BX = BX - RADIUS_OF_TENNIS  # offsets ball to avoid slithering behaviour
        TENNIS_SPEED_X = - TENNIS_SPEED_X  # reverse direction of ball in x- direction

    # reverses ball speed on contact with right paddle

    if BX <= RADIUS_OF_TENNIS + PADDLE_WIDTH and Y1 < BY < Y1 + PADDLE_HEIGHT:

        BX = BX + RADIUS_OF_TENNIS   # offsets ball to avoid slithering behaviour
        TENNIS_SPEED_X = -TENNIS_SPEED_X   # reverses direction of ball

    # conditions to determine whether game is in progress

    if BX > WINDOW_WIDTH - RADIUS_OF_TENNIS or BX <  RADIUS_OF_TENNIS:

        game_in_progress = False
        game_over = True

        # centres ball at the middle of screen when game is over
        
        BX = WINDOW_WIDTH // 2
        BY = WINDOW_HEIGHT // 2


# creates overall graphics of the game

def main_game():

    paddle_movements()
    court()
    paddles()
    draw_tennis()
    ball_movement()
    game_over_text()



# starts animation

start_graphics(main_game, title="PONG", framerate=50, width=WINDOW_WIDTH, height=WINDOW_HEIGHT, key_press=press,
               key_release=release)