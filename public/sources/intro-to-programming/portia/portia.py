# This section defines the variables I used in this program

BRUTUS_INTEREST_RATE = 5             # interest rate of Brutus investment (in percentage)
BRUTUS_INITIAL_DEPOSIT = 1.00        # initial amount Brutus deposited ( in USD )
CURRENT_YEAR = 2018                  # present year after savings
START_YEAR = 1                       # year (in AD) where Brutus and Portia had their first interest on his money
BRUTUS_BALANCE = (1 + BRUTUS_INTEREST_RATE / 100) * BRUTUS_INITIAL_DEPOSIT   # Brutus balance after first year

PORTIA_INTEREST_RATE = 4           # Portia's interest rate ( in percentages )
PORTIA_INITAL_DEPOSIT = 100000.00  # Portia's initial deposit ( in USD )
PORTIA_BALANCE = PORTIA_INITAL_DEPOSIT * (1 + PORTIA_INTEREST_RATE / 100)  # Portia's balance after one year




while START_YEAR < CURRENT_YEAR and BRUTUS_BALANCE < PORTIA_BALANCE:

    START_YEAR = START_YEAR + 1
    PORTIA_BALANCE = PORTIA_BALANCE * (1 + PORTIA_INTEREST_RATE/100)
    BRUTUS_BALANCE = BRUTUS_BALANCE * (1 + BRUTUS_INTEREST_RATE / 100)

    if BRUTUS_BALANCE > PORTIA_BALANCE:
        # Year Brutus' balance exceeded Portia's
        print('')   # blank space
        print(str(START_YEAR) + " is the first time Brutus' balance exceeded Portia's balance ")
        print('')   # blank space
        print("In that year, Brutus' balance was " + str(BRUTUS_BALANCE))
        print('')   # blank space
        print("and Portia's balance was " + str(PORTIA_BALANCE))