# bfs.py
# An algorithm that returns the path connecting start and goal vertices
# Akwasi D. Akosah
# November 2,2018
from collections import deque


def breath_first_search(start_vertex, goal_vertex):
    queue = deque()  # creates double-ended queue
    path = []  # initialize path as an empty list
    queue.append(start_vertex)  # starts queue with start vertex
    back_pointer={}   # creates a dictionary to keep track of backpointers
    back_pointer[start_vertex] = None  # sets the backpointer start vertex as None

    while len(queue) > 0:
        vertex = queue.popleft()  # removes vertex item that has been in list the longest
        if vertex == goal_vertex:
            while vertex!= None:
                path.append(vertex)  # append vertex to path list
                vertex = back_pointer[vertex]  # sets vertex to its backpointer
        else:
            for adj_vertex in vertex.adjacency_list: # loop through adjacent vertices of a given vertex
                if adj_vertex not in back_pointer:   # checks if adjacent vertex has been visited
                    back_pointer[adj_vertex] = vertex  # stores backpointer of adjacent vertex as its vertex
                    queue.append(adj_vertex)  # adds adjacent vertex to queue

    return path   # return a list of vertex objects in path

