from counterclass import *


class Timer:

    def __init__(self, hours=24, minutes=60, seconds=60):
        # initialize instance variables for time in hours,minutes and seconds

        self.hours = Counter(24, hours, 2)
        self.minutes = Counter(60, minutes, 2)
        self.seconds = Counter(60, seconds, 2)

    def __str__(self):

        # strings timer in the format hh:mm:ss
        return str(self.hours) + ":" + str(self.minutes) + ":" + str(self.seconds)



    # decrements time values by one and wraps accordingly

    def tick(self):

        if self.seconds.tick():
           if self.minutes.tick():
                self.hours.tick()

    # returns a boolean if hours,minutes and seconds equals zero

    def is_zero(self):
        return self.hours.initial == 0 and self.minutes.initial == 0 and self.seconds.initial == 0
