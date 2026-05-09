

# function puts pivot into position and return index of pivot
def partition(the_list, compare_function, p, r):
    i = p-1
    j = p
    pivot = the_list[r]   # choose pivot at last index of list

    while j < r:
        if compare_function(the_list[j], pivot):
            the_list[j], the_list[i+1] = the_list[i+1], the_list[j]  # swap i and j positions
            i = i + 1
        j = j + 1
    the_list[r], the_list[i+1] = the_list[i+1], the_list[r]  # swap pivot into position

    return i + 1    # returns index of pivot


# function sorts list
def quicksort(the_list, compare_function, p=0, r=None):

    if r == None:
        r = len(the_list)-1
    # recursively calls partition and quick sort
    if r > p:
        pivot_position = partition(the_list, compare_function, p, r)
        quicksort(the_list, compare_function, p, pivot_position - 1)
        quicksort(the_list, compare_function, pivot_position + 1, r)

    return the_list     # returns list after sorting

