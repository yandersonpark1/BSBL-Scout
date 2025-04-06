import pandas as pd
import numpy as np
from matplotlib import pyplot as plt

#General Summary
def importantValues (): 
    return ["Pitch Type","Velocity","VB (trajectory)", "HB (trajectory)"]

#The average d3 baseball pitcher throws 77-82 mph 
def fastballType(file): 
    report = []
    
    #Reads file
    df = pd.read_csv(file, usecols = ["Pitch Type","Velocity","VB (trajectory)", "HB (trajectory)"])
    df_fb = df.copy()
    
    #Cleans data and looks for fastballs
    df_fb["Velocity"] = pd.to_numeric(df_fb["Velocity"], errors='coerce')
    df_fb["VB (trajectory)"] = pd.to_numeric(df_fb["VB (trajectory)"], errors='coerce')
    df_fb["HB (trajectory)"] = pd.to_numeric(df_fb["HB (trajectory)"], errors='coerce')
    df_fb = df_fb.dropna()
    
    #Filters through grading fastball
    def classify(row):
        vel = row["Velocity"]
        hb = row["HB (trajectory)"]
        vb = row["VB (trajectory)"]
        if vel < 79: 
            report.append("Your fastball velocity is bad: ")
        elif vel >= 79 and vel <= 83:
            report.append("Your fastball velocity is average: ")
        elif vel >= 84 and vel <= 88: 
            report.append("Your fastball velocity is great: ")
        else: 
            report.append("Your fastball velocity is elite: ")
        if abs(hb) >  : 
            report.append("Your fastball is a good pitch: ")
