import pandas as pd
import numpy as np
from matplotlib import pyplot as plt

#General Summary
def importantValues (): 
    return ["Pitch Type","Velocity","VB (trajectory)", "HB (trajectory)"]

def sortHB(file):   
    try:
        sample_data = pd.read_csv(file, usecols=["HB (trajectory)"])
    except ValueError:
        print("Error: Column 'HB (trajectory)' not found in the file.")
        return None
    except FileNotFoundError:
        print(f"Error: The file {file} does not exist.")
        return None
    
    #Reads file
    sample_data = pd.read_csv(file, usecols = ["HB (trajectory)"])
    
    #sorts through HB values for plotting
    HB_sorted = sample_data.sort_values(by = "HB (trajectory)", ascending = True)
    
    return HB_sorted["HB (trajectory)"]

def sortVB(file):   
    try:
        sample_data = pd.read_csv(file, usecols=["VB (trajectory)"])
    except ValueError:
        print("Error: Column 'VB (trajectory)' not found in the file.")
        return None
    except FileNotFoundError:
        print(f"Error: The file {file} does not exist.")
        return None
    
    #Reads file
    sample_data = pd.read_csv(file, usecols = ["VB (trajectory)"])
    
    #sorts through VB values for plotting
    VB_sorted = sample_data.sort_values(by = "VB (trajectory)", ascending = True)
    
    return VB_sorted["VB (trajectory)"]
    


def pitchPlot(file): 
    #Reads file
    sample_data = pd.read_csv(file, usecols = ["VB (trajectory)"])
    
    #sorts through VB values for plotting
    VB_sorted = sample_data.sort_values(by = "VB (trajectory)", ascending = True)
    HB_sorted = sample_data.sort_values(by = "VB (trajectory)", ascending = True)
    return (HB_sorted, VB_sorted)


file = 'sample_data.csv'




#creates appropriate plot
plt.xlim(-30,30)
plt.ylim(-30,30)
plt.axhline(0, color='black', lw=1)
plt.axvline(0, color='black', lw=1)

plt.scatter(sortHB(file), sortVB(file))

plt.xlabel("Horizontal Break")
plt.ylabel("Vertical Break")
plt.show()
