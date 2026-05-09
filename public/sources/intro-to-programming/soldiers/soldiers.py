# create soldier class
class Soldier:
    # initializes all instance variables for Soldier class
    def __init__(self, number):
        self.number = number
        self.next = None
        self.prev = None

    # kills and prints soldier killed
    def kill(self, prefix, suffix):
        self.prev.next = self.next
        self.next.prev = self.prev
        print(prefix + str(self.number) + suffix)


# creates army class which is used to create a cycle of soldier objects
class Army:
    # initialize number of soldiers in army
    def __init__(self, number_of_soldiers):
        self.soldiers_alive = number_of_soldiers
        self.first_soldier = Soldier(1)  # creates first soldier
        self.first_soldier.prev = self.first_soldier  # let prev node of first soldier reference itself
        self.first_soldier.next = self.first_soldier  # let next node of first soldier reference itself

        # creates a circular linked list of soldiers in an army
        for i in range(2, number_of_soldiers + 1):
            new_soldier = Soldier(i)

            new_soldier.next = self.first_soldier.next
            new_soldier.prev = self.first_soldier

            new_soldier.next.prev = new_soldier
            self.first_soldier.next = new_soldier

            self.first_soldier = new_soldier

    # advances current victim by that remaining soldiers
    def advance(self, advance_by):
        for i in range(advance_by):
            self.first_soldier = self.first_soldier.next

    # iterates through army and kill soldiers in specific advancements
    def kill_all(self, advance_by):
        while self.soldiers_alive > 1:
            self.advance(advance_by)   # advances by a specific number through soldiers
            prev_soldier = self.first_soldier
            self.first_soldier.kill("Soldier ", " was killed")
            self.soldiers_alive -= 1  # decrease alive soldiers by one
            self.first_soldier = prev_soldier

        self.advance(advance_by)   # after killing all soldiers, look for the remaining soldier
        self.first_soldier.kill("The last remaining Soldier is ", " .")


n = int(input("Enter number n of soldiers, at least 2: 41"))   # ask input for number of soldiers
k = int(input("Enter spacing between victims, between 1 and n: 2"))  # ask input for number of soldiers

spartans = Army(n)    # creates army object
spartans.kill_all(k)  # kill in specific order

