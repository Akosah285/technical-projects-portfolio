# choose.py
# Akwasi D. Akosah
# Program computes the different number of ways
# you can choose from a given number


def choose(n, k):

    # if k is zero or equal to n ,there is only one way to choose
    # return one

    if k == 0 or k == n:   # Base cases
        return 1           # returns value of one to the function
    else:
        return choose(n-1, k) + choose(n-1, k-1)    # recursive case which computes choose


print(choose(51, 5))    # prints number of way we can choose to console

