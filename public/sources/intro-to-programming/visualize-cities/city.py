# city.py
# creates city class
# Akwasi Akosah
# October 2018

class City:
    def __init__(self, country_code, name, region, population, latitude, longitude):
        # initialize all instance variables for the object

        self.country_code = country_code
        self.name = name
        self.region = region
        self.population = population
        self.latitude = latitude
        self.longitude = longitude


    def __str__(self):
        # returns a string of city name,population,latitude and longitude
        return self.name + "," + str(self.population) + "," + str(self.latitude) + "," + str(self.longitude)

