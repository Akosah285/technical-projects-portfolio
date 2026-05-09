from counterclass import Counter
# counters to test code

my_counter1 = Counter(15, 21, 4)  # tests what happens if initial is greater than limit
my_counter2 = Counter(10, 0, 4)   # tests if code wraps
my_counter3 = Counter(12, 11, 4)  # tests when initial is between zero and limit - 1

# test for counter1


my_counter1.get_value()        # gets value
print(my_counter1.get_value()) # prints value
print(my_counter1)             # prints with concatenation

my_counter1.tick()              # updates initial value
print(my_counter1.get_value())  # gets updated value and print
print(my_counter1)              # prints with concatenation


# test for counter 2

# gets value ,prints value and print with concatenation
my_counter2.get_value()
print(my_counter2.get_value())
print(my_counter2)

# updates value by tick ,gets value and then print to console
my_counter2.tick()
print(my_counter2.get_value())
print(my_counter2)


# gets value ,prints value and print with concatenation
my_counter3.get_value()
print(my_counter3.get_value())
print(my_counter3)

# updates value by tick ,gets value and then print to console
my_counter3.tick()
print(my_counter3.get_value())
print(my_counter3)
