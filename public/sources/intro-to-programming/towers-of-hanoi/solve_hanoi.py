# solve_hanoi.py
# computes moves to solve hanoi


def solve_hanoi(n, start_peg, end_peg):
    if n == 1:    # Base case
        print("Move disk 1 from peg " + str(start_peg) + " to peg " + str(end_peg))

    if n >= 2:   # Recursive case
        spare_peg = 6 - (start_peg + end_peg)      # determines the spare peg at any instance
        solve_hanoi(n-1, start_peg, spare_peg)     # recursively move disk 1 through n-1 from start peg to spare peg
        print("Move disk " + str(n) + " from peg " + str(start_peg) + " to peg " + str(end_peg))
        solve_hanoi(n-1, spare_peg, end_peg)       # recursively move disk 1 through disk n-1 from start peg to end_peg


solve_hanoi(5, 1, 2)
