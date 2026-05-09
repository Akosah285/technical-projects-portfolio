# cell.py
# Class for a cell in the Game of Life.

from cs1lib import *

CELL_SIZE = 20  # width and height of each cell, in pixels

class Cell:
    # Initialize a new Cell.
    def __init__(self, row, column):
        self.living = False
        self.x = column * CELL_SIZE
        self.y = row * CELL_SIZE

    # Kill this Cell.
    def kill(self):
        self.living = False

    # Make this Cell be alive.
    def revive(self):
        self.living = True

    # Return a boolean saying whether this Cell is alive.
    def is_living(self):
        return self.living

    # If this Cell is alive, make it dead.
    # If it's dead, make it alive.
    def flip(self):
        self.living = not self.living

    # Have a Cell draw itself.
    def draw(self):
        enable_stroke()
        set_stroke_color(0, 0, 0)   # black border for all cells
        if self.living:
            set_fill_color(0, 0, 1) # living cells are blue
        else:
            set_fill_color(1, 1, 0) # dead cells are yellow

        draw_rectangle(self.x, self.y, CELL_SIZE, CELL_SIZE)

    def emulate(self, other):

        self.living = other.living
