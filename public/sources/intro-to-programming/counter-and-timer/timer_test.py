from timer import Timer


my_timer = Timer(1, 30, 0)

# loops through timer
while not my_timer.is_zero():

    print(my_timer)  # prints timer value
    my_timer.tick()  # decrements timer value

print(my_timer)

# Extra
# Tests to see if timer wraps back when hours ,minutes and seconds equals zero
print("")
my_timer.tick()
print(my_timer)

