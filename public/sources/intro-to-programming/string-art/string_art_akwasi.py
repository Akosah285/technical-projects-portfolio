from cs1lib import*
# program to draw string art
# Akwasi Akosah
# September 21 ,2018.


def string_art(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b, n):
    # draws strings and stick

    # x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b are the coordinates for the sticks
    # n is the number of strings

    set_stroke_width(3)            # sets stroke width to 3 pixels
    set_stroke_color(1, 0, 0)      # makes sticks red
    draw_line(x1a, y1a, x2a, y2a)  # draws stick A
    draw_line(x1b, y1b, x2b, y2b)  # draws stick B

    x = 0
    while x <= n:

        # draw strings with different colors

        set_stroke_color(0, x / n, 1)   # variates string color
        set_stroke_width(1)             # set string width to 1 pixel

        draw_line(x1a + x / n * (x2a - x1a), y1a + x / n * (y2a - y1a), x1b + (1.0 - x / n) * (x2b - x1b),
                  y1b + (1 - x / n) * (y2b - y1b))    # draws strings
        x = x + 1

def main():

    clear()                        # clears background
    set_clear_color(0, 0, 0)       # sets background color to black
    string_art(30, 40, 60, 220, 300, 195, 200, 350, 30)



start_graphics(main ,title = "String Art")   # draws strings and sticks