# Program to draw eggs and ham
# Author Akwasi Akosah September,2018

from cs1lib import *

# function to draw Ham and Eggs


# create background



def make_background_red():
    set_clear_color(1, 0, 0, .8)  # red
    clear()

# fills spaces with white color

def set_fill_white():
    set_fill_color(1, 1, 1)  # white

# fill spaces with green color

def set_fill_green():
    set_fill_color(0, 1, 0)  # green

# sets stroke color to black

def set_stroke_black():
    set_stroke_color(0, 0, 0)  # black

# sets stroke color to blue

def set_stroke_blue():
    set_stroke_color(0, 0, 1)  # blue

# function draws the plate

def draw_plate():

    enable_stroke()
    set_stroke_width(2)
    set_stroke_black()
    set_fill_white()
    draw_triangle(300, 30,  60, 200,  340, 320)



# function draws_ham_and_bone
def draw_ham():

    disable_stroke()
    set_fill_green()
    draw_ellipse(247, 125, 50, 35)

# function draws_bone

def draw_bone():

    set_fill_white()
    draw_circle(247, 125, 7)

# function draws eggs

def draw_eggs():

    enable_stroke()
    set_stroke_width(2)
    set_stroke_black()
    draw_ellipse(135, 195, 35, 20)
    draw_ellipse(240, 245, 35, 20)

#function draws yolk of egg

def draw_yolk():

    disable_stroke()
    set_fill_green()
    draw_circle(135, 195, 10)
    draw_circle(240, 245, 10)

# dimensions for drawing fork

x =  45 # starting point of fork
y = x + 60  # length of fork handle
z = y + 20  # length_of_prongs
p = 210  # position_of_first_prong

# function draws fork

def draw_fork():

    enable_stroke()
    set_stroke_blue()
    draw_line(218, x,  218, y)
    draw_line(p, y, p + 15, y)
    draw_line(p, y, 210, z)
    draw_line(p + 5, y, 215, z)
    draw_line(p + 10, y, 220, z)
    draw_line(p + 15, y, 225, z)

# prints name of artist

def name_of_great_designer():

    name = "Akwasi Akosah"
    enable_stroke()
    set_stroke_width(2)
    set_stroke_black()
    draw_text(name, 10, 380)

# Draw eggs ang ham

def draw_green_eggs_and_ham():
    make_background_red()
    draw_plate()
    draw_ham()
    draw_bone()
    draw_eggs()
    draw_yolk()
    draw_fork()
    name_of_great_designer()

start_graphics(draw_green_eggs_and_ham)