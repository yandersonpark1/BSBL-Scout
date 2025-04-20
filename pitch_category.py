import pandas as pd
import plotly.express as px
from data_visual import ScatterPlot

#cleans data file for easy use in Rapsodo
class pitch_category:
    def __init__(self, file): 
        self.file = file
        self.df = None
    
    #Cleans data and sets to self.file for use in other functions
    def cleanData(self):
        df = pd.read_csv(self.file)
        df = df.drop(columns = ["No","Date","Pitch ID","Strike Zone Height","Spin Confidence","SSW VB","SSW HB","VB (spin)","HB (spin)","Horizontal Angle","Unique ID","Device Serial Number","SO - latLongConfidence","SO - latitude","SO - longitude","SO - rotMatConfidence","SO - timestamp","SO - Xx","SO - Xy","SO - Xz","SO - Yx","SO - Yy","SO - Yz","SO - Zx","SO - Zy","SO - Zz"])
        self.df = df
        return self.df


    #Method to get Basic Values 
    def importantValues(self): 
        return ["Pitch Type","Velocity","VB (trajectory)", "HB (trajectory)"]

    #Method to help clean data; will remove any outliers from pitch data as to not skew results and give better averages 
    def outliers(self): 
        pass
    
    #creates File for only fastball data for Rapsodo
    def fastballFile(self): 
        fastball_velo = ""
        fastball_type = ""
        profile = ""
    
        #Reads file
        df = pd.read_csv(self.file, usecols = self.importantValues())
        df_fb = df.copy()
    
        #Cleans data and looks for fastballs (Need to Change 2S, CT to exact value)
        df_fb = df_fb[df_fb["Pitch Type"].str.contains("Fastball|2S|Ct", case = False, na=False, regex = True)]

        df_fb["Velocity"] = pd.to_numeric(df_fb["Velocity"], errors='coerce')
        df_fb["VB (trajectory)"] = pd.to_numeric(df_fb["VB (trajectory)"], errors='coerce')
        df_fb["HB (trajectory)"] = pd.to_numeric(df_fb["HB (trajectory)"], errors='coerce')
        df_fb = df_fb.dropna()
    
    #Filters through grading fastball
        def fastballClassifyFile(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
        
            #Pitch-Velo Classification
            if vel < 79: 
                fastball_velo = ("bad ")
            elif vel >= 79 and vel <= 83:
                fastball_velo = ("average")
            elif vel >= 84 and vel <= 88: 
                fastball_velo = ("great")
            else: 
                fastball_velo = ("elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 16:
                fastball_type = ("Four-Seam")
            else: 
                fastball_type = "Two-Seam"

            #Pitch Type - VB Classification
            if vb < 12: 
                if fastball_type == "Cutter": 
                    fastball_type = "Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Sinker"
            elif vb >= 12 and vb <= 16:
                if fastball_type == "Cutter": 
                    fastball_type = "Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Two-Seam"
            else: 
                if fastball_type == "Cutter": 
                    fastball_type = "Cut-Ride Fastball"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Carry Fastball"
                else: 
                    fastball_type = "Ride-Run Fastball"
        
            profile = f"{fastball_type} with a velocity of {vel} mph which is {fastball_velo}." 
            return profile
    
        #Applies classification to dataframe
        df_fb[profile] = df_fb.apply(fastballClassifyFile, axis=1)
        return df_fb[profile]

    def fastballAverage(self): 
        profile = ""
    
        #Reads file
        df = pd.read_csv(self.file, usecols = self.importantValues())
        df_fb = df.copy()
    
        #Cleans data and looks for fastballs (Need to Change 2S, CT to exact value)
        df_fb = df_fb[df_fb["Pitch Type"].str.contains("Fastball|2S|Ct", case = False, na=False, regex = True)]
    
        df_fb["Velocity"] = pd.to_numeric(df_fb["Velocity"], errors='coerce')
        df_fb["VB (trajectory)"] = pd.to_numeric(df_fb["VB (trajectory)"], errors='coerce')
        df_fb["HB (trajectory)"] = pd.to_numeric(df_fb["HB (trajectory)"], errors='coerce')
        df_fb = df_fb.dropna()
    
        fastball_avg_velo = df_fb["Velocity"].mean()
        fastball_avg_VB = df_fb["VB (trajectory)"].mean()
        fastball_avg_HB = df_fb["HB (trajectory)"].mean()
    
        def fastballClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB):
            vel = fastball_avg_velo
            hb = fastball_avg_HB
            vb = fastball_avg_VB
        
            #Pitch-Velo Classification
            if vel < 79: 
                fastball_velo = ("bad ")
            elif vel >= 79 and vel <= 83:
                fastball_velo = ("average")
            elif vel >= 84 and vel <= 88: 
                fastball_velo = ("great")
            else: 
                fastball_velo = ("elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 16:
                fastball_type = ("Four-Seam")
            else: 
                fastball_type = "Two-Seam"
            
            #Pitch Type - VB Classification
            if vb < 12: 
                if fastball_type == "Cutter": 
                    fastball_type = "Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Sinker"
            elif vb >= 12 and vb <= 16:
                if fastball_type == "Cutter": 
                    fastball_type = "Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Two-Seam"
            else: 
                if fastball_type == "Cutter": 
                    fastball_type = "Cut-Ride Fastball"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Carry Fastball"
                else: 
                    fastball_type = "Ride-Run Fastball"
        
            profile = f"{fastball_type} with a velocity of {round(vel, 1)} mph which is {fastball_velo}." 
            return profile
    
        return {
            "Velocity": round(fastball_avg_velo, 1),
            "VB": round(fastball_avg_VB, 1),
            "HB": round(fastball_avg_HB, 1), 
            "Profile": fastballClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB)
        }
    
    #creates File for only slider data for Rapsodo
    def sliderFile(self): 
        slider_velo = ""
        slider_type = ""
        profile = ""
    
        #Reads file
        df = pd.read_csv(self.file, usecols = self.importantValues())
        df_sl = df.copy()
    
        #Cleans data and looks for fastballs
        df_sl = df_sl[df_sl["Pitch Type"].str.contains("Slider", na=False)]
    
        df_sl["Velocity"] = pd.to_numeric(df_sl["Velocity"], errors='coerce')
        df_sl["VB (trajectory)"] = pd.to_numeric(df_sl["VB (trajectory)"], errors='coerce')
        df_sl["HB (trajectory)"] = pd.to_numeric(df_sl["HB (trajectory)"], errors='coerce')
        df_sl = df_sl.dropna()
    
        def sliderClassifyFile(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
        
            #Pitch-Velo Classification/ Need to classify velocity depending on FB
        
        
            #Pitch type classification 
            if abs(hb) <= 5:
                slider_type = ("Gyro") 
            elif abs(hb) > 5 and abs(hb) <= 12:
                slider_type = ("Slider")
            else: 
                slider_type = "Sweeper"
            
            #Pitch Type - VB Classification
            if vb > -5: 
                pass
            elif vb < -5 or vb >-10:
                if slider_type == "Slider": 
                    slider_type = "Slurve"
        
            profile = f"{slider_type} with a velocity of {vel} mph which is {slider_velo}." 
            return profile
    
        #Applies classification to dataframe
        df_sl[profile] = df_sl.apply(sliderClassifyFile, axis=1)
        return df_sl[profile]

    #Changeup will need to use Deviations
    def changeupType(file): 
        pass

def main(): 
    file = input ("Enter the file name (with .csv extension): ")  # change this if the file is named differently
    run_file = pitch_category(file)
    print((run_file.cleanData()))
    print(run_file.fastballFile())
    print(run_file.sliderFile())
    
    avg_fastball = run_file.fastballAverage()
    print("Fastball Averages:")
    for key, value in avg_fastball.items():
        print(f"{key}: {value}")
    
    ScatterPlot(file)
    

if __name__ == "__main__":
    main()
