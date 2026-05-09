
from city import*
from quicksort import*


# compare city objects in alphabetical order
def compare_lexically(cities1, cities2):
    return str.lower(cities1.name) < str.lower(cities2.name)


# compare city population from highest to lowest
def compare_population(cities1, cities2):
    return cities1.population >= cities2.population


# compare city objects based on latitudes
def compare_latitude(cities1, cities2):
    return cities1.latitude <= cities2.latitude


# function to sort by attribute comparison
def sort(the_list, compare_func):
    quicksort(the_list, compare_func)


cities_alpha = []  # create empty list for arranging cities in alphabetical order

in_file = open("world_cities.txt", "r")  # opens and read text file
for line in in_file:
    index = line.split(",")
    lexical_city = City(index[0], index[1], index[2], index[3], index[4], index[5])  # create city objects from list
    cities_alpha.append(lexical_city)     # add each created object to list

sort(cities_alpha, compare_lexically)    # sort city objects alphabetically
in_file.close()


out_file = open("cities_alpha", "w")    # opens a new file to write to
for lexical_city in cities_alpha:
    out_file.write(str(lexical_city) + '\n')

out_file.close()


cities_pop = []  # creates empty list for sorting cities based on population
world_population = open("world_cities.txt", "r")  # opens and read text file

for line in world_population:
    p_list = line.split(",")
    population = City(p_list[0], p_list[1], p_list[2],p_list[3], p_list[4], p_list[5])
    cities_pop.append(population)

sort(cities_pop, compare_population)
world_population.close()

out_pop = open("cities_population.txt","w")
for population in cities_pop:
    out_pop.write(str(population) + '\n')

out_pop.close()

cities_latitude = []
latitude_file = open("world_cities.txt", "r")
for line in latitude_file:
    latitude_index = line.split(",")
    latitude = City(latitude_index[0], latitude_index[1], latitude_index[2], latitude_index[3], latitude_index[4], latitude_index[5])
    cities_latitude.append(latitude)

sort(cities_latitude, compare_latitude)
latitude_file.close()

out_lat = open("cities_latitude.txt","w")
for latitude in cities_latitude:
    out_lat.write(str(latitude) + '\n')

out_lat.close()
