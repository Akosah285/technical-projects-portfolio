class Counter:

    def __init__(self, limit, initial=0, min_digits=1):

        # Instance variables for my counter

        self.limit = limit
        self.initial = initial
        self.min_digits = min_digits

        # sets range of values to input
        if self.initial < 0 or self.initial > self.limit - 1:

            print("Error, number out of range")
            self.initial = self.limit - 1

    # returns initial value

    def get_value(self):
        return self.initial

    # converts value to string  and part them to the front with zeroes when necessary

    def __str__(self):

        if self.min_digits - len(str(self.initial)) > 0 :
            return str(0)*(self.min_digits - len(str(self.initial))) + str(self.initial)
        else:
            return str(str(self.initial))

    # decrements counter's value by one and wraps it when necessary

    def tick(self):

        if self.initial - 1 < 0:
            self.initial = self.limit - 1
            return True
        else :
            self.initial = self.initial - 1
            return False




