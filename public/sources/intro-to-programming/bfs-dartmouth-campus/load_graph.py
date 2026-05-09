from vertex import *


# opens and read files
def load_function(data_file):
    dartmouth_campus = open(data_file, "r")   # opens txt file
    campus_dictionary = {}
    for vertex in dartmouth_campus:
        vertex.strip()
        vertex_info = vertex.split(";")  # create list of each line separated by semi-colons
        coordinates = vertex_info[2].split(",")  # creates a list from index two by separating commas
        landmark = Vertex(vertex_info[0], int(coordinates[0]), int(coordinates[1]))  # create vertex objects
        campus_dictionary[vertex_info[0]] = landmark  # stores vertex object in dictionary using name as key

    dartmouth_campus.close()

    dartmouth_campus_adjacent = open(data_file, "r")
    for line in dartmouth_campus_adjacent:
        line.strip()
        adjacent_data = line.split(";")
        list_of_adjacent = adjacent_data[1].split(",")
        adjacent_datum = campus_dictionary[str(adjacent_data[0])]

        for item in list_of_adjacent:
            my_list = item.strip()
            adjacent_datum.adjacency_list.append(campus_dictionary[my_list]) # append adjacent objects to adjacency list
    dartmouth_campus_adjacent.close()

    return campus_dictionary  # returns a dictionary of vertex objects

