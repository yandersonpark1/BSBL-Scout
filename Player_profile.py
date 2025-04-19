from data_visual import ScatterPlot
from pitch_category import cleanData

class PlayerProfile: 
    def __init__(self): 
        self.name = "" 
        self.profile = []
        self.eval = ""
    
    def add_name(self): 
        self.name = input("Enter the player's name: ")
        