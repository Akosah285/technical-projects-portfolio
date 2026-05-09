# map_plot.py
# plots smallest length between vertices indicating routes between them
# uses breath first search to find paths
from cs1lib import *
from bfs import *
from load_graph import*

# Constants
WINDOW_HEIGHT = 811
WINDOW_WIDTH = 1012

# initialize state variables
start_vertex = None
goal_vertex = None
mouse_pressed = False

# initialize the coordinates for start vertex and goal vertex
x_coordinate_start = 0
y_coordinate_start = 0
x_coordinate_goal = 0
y_coordinate_goal = 0


def map_background():
    # draws map of college as background
    img = load_image("dartmouth_map.png")
    draw_image(img, 0, 0)


def draw_graph():
    # draws all lines that connect all vertices on graph
    for vertices in dictionary:
        dictionary[vertices].draw_vertices()
        dictionary[vertices].draw_adjacent_edges()


# Update the state variables when the mouse button is pressed.
# mx and my are the current location of the mouse in the window.
def mouse_press_event(mx, my):
    global start_vertex, mouse_pressed, x_coordinate_start, y_coordinate_start
    mouse_pressed = True
    x_coordinate_start = mx
    y_coordinate_start = my


# Update the state variables when the mouse button is moved.
# mx and my are the current location of the mouse in the window.
def mouse_move_event(mx, my):
    global goal_vertex, mouse_pressed, x_coordinate_goal, y_coordinate_goal
    x_coordinate_goal = mx
    y_coordinate_goal = my


# indicates vertex when mouse is pressed on vertex
def indicate_start_vertex():
    global start_vertex, mouse_pressed, x_coordinate_start, y_coordinate_start

    for vertices in dictionary:
        if mouse_pressed and dictionary[vertices].within_range(x_coordinate_start, y_coordinate_start):
            dictionary[vertices].draw_vertices(1, 0, 0)  # draw vertex in position

            # draw vertex name at vertex location
            enable_stroke()
            set_stroke_width(2)
            set_stroke_color(0.7, 0, 0.7)   # color purple
            draw_text(dictionary[vertices].name_of_vertex, dictionary[vertices].x_loc, dictionary[vertices].y_loc)

            # update start vertex to the current position clicked
            start_vertex = dictionary[vertices]


# indicate goal vertex when start vertex is selected and mouse is moved
def indicate_goal_vertex():
    global mouse_pressed, goal_vertex

    for vertices in dictionary:
        if mouse_pressed and dictionary[vertices].within_range(x_coordinate_goal, y_coordinate_goal):
            dictionary[vertices].draw_vertices(1, 0, 0)  # draws goal vertex

            # update goal vertex to the current position when mouse hovers over it
            goal_vertex = dictionary[vertices]


# plots the graph of path between start vertex and goal vertex
def draw_path():
    global goal_vertex, start_vertex, x_coordinate_goal, y_coordinate_goal, x_coordinate_start, y_coordinate_start

    if start_vertex != None and goal_vertex!=None:
        route = breath_first_search(start_vertex, goal_vertex)  # stores path returned by breadth_first_search
        for i in range(len(route)-1):  # index through the path
            route[i].draw_edges(route[i+1], 1, 0, 0)   # draw edges in red
            route[i].draw_vertices(1, 0, 0)
            # indicates names of vertex along the path
            enable_stroke()
            set_stroke_width(2)
            set_stroke_color(0.7, 0, 0.7)  # color text purple
            draw_text(route[i].name_of_vertex, route[i].x_loc, route[i].y_loc)


# plots graphs and paths
def plot():
    map_background()
    draw_graph()
    indicate_start_vertex()
    indicate_goal_vertex()
    draw_path()


start_graphics(plot, width=WINDOW_WIDTH, height=WINDOW_HEIGHT, mouse_press=mouse_press_event,\
               mouse_move=mouse_move_event, title="BIG GREEN CAMPUS MAP")