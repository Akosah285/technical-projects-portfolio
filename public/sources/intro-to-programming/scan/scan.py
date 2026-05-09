# scan.py
# Performs inclusive and exclusive scan operations on a list.

def plus(a, b):
    return a + b

def times(a, b):
    return a * b

# Perform an inclusive scan operation on my_list, given an operation.
# When done, my_list[i] should contain the result of the operation
# performed on my_list[0] through my_list[i], and my_list[0] should
# remain unchanged.

def inclusive_scan(my_list, operation):

    # YOU FILL THIS IN.
    for i in range(1,len(my_list)):
        my_list[i] = operation(my_list[i-1], my_list[i])

# Perform an exclusive scan operation on my_list, given an operation
# and the identity for the operation.  When done, my_list[i] should
# contain the result of the operation performed on my_list[0] through
# my_list[i-1], and my_list[0] should contain the identity.
def exclusive_scan(my_list, operation, identity):
    # YOU FILL THIS IN.

    previous = my_list[0]
    my_list[0] = identity
    for i in range(1, len(my_list)):
        new_position= my_list[i]
        my_list[i]= operation(previous, my_list[i-1])
        previous = new_position

numbers = [3, 6, 2, 1, 4, 7]
print("The list: ", numbers)
#exclusive_scan(numbers, plus, 0)
print("After an exclusive plus-scan:", numbers)

numbers = [3, 6, 2, 1, 4, 7]
print("The list: ", numbers)
inclusive_scan(numbers, plus)
print("After an inclusive plus-scan:", numbers)

numbers = [2, 4, 2, 6, 2]
print("The list: ", numbers)
exclusive_scan(numbers, times, 1)
print("After an exclusive times-scan:", numbers)

numbers = [2, 4, 2, 6, 2]
print("The list: ", numbers)
inclusive_scan(numbers, times)
print("After an inclusive times-scan:", numbers)
