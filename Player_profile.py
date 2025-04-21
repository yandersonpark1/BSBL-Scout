from data_visual import ScatterPlot
from pitch_category import pitch_category

#needs work may need to inherit 
class PlayerProfile: 
    def __init__(self, name): 
        self.name = name
        self.profile = []
        self.eval = ""
        self.file = name + "Data.csv"
        
    def fastballProfile(self): 
        self.file.fastballFile()
        
        avg_fastball = self.file.fastballAvg()
        
        print("Fastball Averages:")
        
        for key, value in avg_fastball.items():
            print(f"{key}: {value}")

def main(): 
    player_name = input("Enter the player's name: ")
    player = PlayerProfile(player_name)
    player.fastballProfile()
    
if __name__ == "__main__":
    main()