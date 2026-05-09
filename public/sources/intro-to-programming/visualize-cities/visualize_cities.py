from cs1lib import*
from sort_cities import*
from random import*

# State variables
WINDOW_HEIGHT = 360
WINDOW_WIDTH = 720
TOTAL = 50
RADIUS_OF_PLOT = 5

# number of cities to begin with
number_of_cities = 1


# function draws cities one after the other
def draw_cities():
    global number_of_cities
    for i in range(number_of_cities):   # loop through number of cities
        x = WINDOW_WIDTH/2 + (cities_pop[i].longitude*WINDOW_WIDTH/2)/180
        y = WINDOW_HEIGHT/2 - (cities_pop[i].latitude*WINDOW_HEIGHT/2)/90

        # choose random color for each plot and change color of original plots
        r = uniform(0, 0.5)
        g = uniform(0, 0.5)
        b = uniform(0, 0.5)

        # draws circles as plots
        disable_stroke()
        set_fill_color(r, g, b)
        draw_circle(x, y, RADIUS_OF_PLOT)

    # condition to restrict the number of cities to plot
    if number_of_cities < TOTAL:
        number_of_cities += 1


# function plots cities on map
def plot_cities():
    img = load_image("world.png")
    draw_image(img, 0, 0)    # draws background map
    draw_cities()           # plot cities


start_graphics(plot_cities, title="WORLD'S POPULOUS CITIES", width=WINDOW_WIDTH, height=WINDOW_HEIGHT, framerate=1)
