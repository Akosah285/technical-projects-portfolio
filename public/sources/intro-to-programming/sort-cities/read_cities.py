# city.py
# creates city class
# Akwasi Akosah
# October 2018

from city import City


def read_cities():

    list_of_cities = []
    world_cities = open("world_cities.txt", "r")

    for line in world_cities:
        line = line.strip()         # strips lines in world_cities.txt
        instance = line.split(",")  # splits lines into item of list by commas
        cities = City(instance[0], instance[1], instance[2], int(instance[3]), float(instance[4]), float(instance[5]))
        list_of_cities.append(cities)  # appends each city object to list of cities

    world_cities.close()  # closes world_cities.txt

    return list_of_cities      # returns a list of city objects


store_read_cities = read_cities()        # read cities and store in

# function that writes cities to cities_out.txt


def write_cities():

    write_city = open("cities_out.txt", "w")         # creates and open a text file

    for cities in store_read_cities:               # loops through all cities
        write_city.write(str(cities) + '\n')       # writes city to text file with new lines at end

    write_city.close()                             # closes file after writing


write_cities()        # creates and writes to created text file



