class Vertex:
    # initialize all instance variables of the vertex object
    def __init__(self, name_of_vertex, x_loc, y_loc):
        self.name_of_vertex = name_of_vertex
        self.x_loc = x_loc
        self.y_loc = y_loc

        # create adjacent list of vertex for each vertex object
        self.adjacency_list = []

    def __str__(self):
        adjacent_string = ""
        # build up the string by iteration
        for i in range(len(self.adjacency_list)):
            # add comma when not the last item in list
            if i < len(self.adjacency_list)-1:
                adjacent_string = adjacent_string + self.adjacency_list[i].name_of_vertex + ", "
            else:
                adjacent_string = adjacent_string + self.adjacency_list[i].name_of_vertex
        # returns a string of vertex object and other info
        return self.name_of_vertex + "; " + "Location: " + str(self.x_loc) + ", " + str(self.y_loc) + "; " \
               + "Adjacent Vertices: " + adjacent_string

