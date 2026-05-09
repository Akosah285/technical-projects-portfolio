# this section defines variables used in this program

BRUTUS_INTEREST_RATE = 5         # interest rate of Brutus investment (in percentage)
BRUTUS_INITIAL_DEPOSIT = 1.00    # initial amount Brutus deposited ( in USD )
CURRENT_YEAR = 2018              # present year after savings
START_YEAR = 1                   # year (in AD) in which Brutus earned first interest
BRUTUS_BALANCE = (1 + BRUTUS_INTEREST_RATE / 100) * BRUTUS_INITIAL_DEPOSIT  # Brutus balance after one year
COST_FOR_ONE_WALL = 2.16e+10

# function prints Brutus balance at 2018 and number of border walls that can be funded

while START_YEAR <= CURRENT_YEAR:

    START_YEAR = START_YEAR + 1
    BRUTUS_BALANCE = BRUTUS_BALANCE * (1 + BRUTUS_INTEREST_RATE / 100)

    if START_YEAR == CURRENT_YEAR:
        print("")  # blank space
        print("At year 2018, the balance is " + str(float(BRUTUS_BALANCE)) + ".")
        print("")  # blank space
        print("The number of walls that could be funded by Prof Cormen is " + str(BRUTUS_BALANCE // COST_FOR_ONE_WALL) + "." )
