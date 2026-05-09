# lab3_checkpoint.py
# CS 1 Lab Assignment #3 checkpoint by THC.
# Creates a dictionary of Vertex objects based on reading in a file.
# Writes out a string for each Vertex object to a file.

from load_graph import load_function

vertex_dict = load_function("dartmouth_graph.txt")  # calls load function

out_file = open("vertices.txt", "w")  # opens and write to vertices.txt
for vertex in vertex_dict:
    out_file.write(str(vertex_dict[vertex]) + "\n")
out_file.close()
