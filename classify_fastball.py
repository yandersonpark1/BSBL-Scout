import pandas as pd 
import plotly.express as px
from data_visual import ScatterPlot

#Fastball Classifications
    #Biggest Data Point for Fastballs is Release height 
    #Limitations with Rapsodo Ability to Read Spin (purely movement and velocity based)
    #Based on Primary Pitch Type (May need seperate file if different fastballs exist)
    #Average Fastball Velo can be adjusted 
    #Oberlin fastball avg velo - 84
    #DeadZone Fastball - VB (11-14.5), |HB| (9-14.5)
        #Need to adjust for release height
        #Typically Need Elite Command or Elite Velocity
        #Look for Spin Direction 1.20 - 1.40
    #Inefficient Fastballs - VB < 11, |HB| (6-14.5)
        #Neither Qualities of HB or VB 
        #Typically need to be fixed with spin axis and direction 
    #Riders - VB >= 15; 9HB - 14.5 |HB|
        #Release Height (Needs Context) 
        #Typically Higher Arm Slots
        #High Vertical with Average Horionzontal
    #Sinkers - < 11 VB, >= 15.0 |HB|
        #Release Height (typically lower arm slots; higher arm slots will play up)
    #Running Fastball - VB 11-14.5; |HB| >= 15
        #Usage plays as HB pitch 
    #Riding Runners - VB >= 15; |HB| >= 15
    #Gyro Fastballs - <11 VB; |HB| <= 5
        #Think Very Hard Gyro Slider as Primary Pitch
    #Standard Cutter - 11-14.5 VB; |HB| <= 5
    #Riding Cutters - VB >=15; |HB| <= 5
        #Combination of Cut and Ride
        
    #Class creates Object with Classified Fastball
    class ClassifyFastball:
        
        """Initializes the ClassifyFastball class with a file, dataframe, fastball velocity, fastball type, and profile."""
        def __init__(self, file, df, fastball_velo, fastball_type, profile):
            self.file = file
            self.fastball_velo = 0 
            self.fastball_type = ""
            self.profile = ""
    
        def fastballFile(self): 
            #Reads file
            self.df = pd.read_csv(self.file, usecols = self.importantValues())
            df_fb = self.df.copy()
    
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
            if vel < 84: 
                fastball_velo = ("Below Average")
            elif vel >= 84 and vel <= 86:
                fastball_velo = ("Average")
            else: 
                fastball_velo = ("Elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 9:
                fastball_type = ("Inefficient")
            elif abs(hb) > 9 and abs(hb) < 15: 
                fastball_type = "Four-Seam"
            else:
                fastball_type = ("Two-Seam")
            

            #Pitch Type - VB Classification
            if vb < 11: 
                if fastball_type == "Cutter": 
                    fastball_type = "Gyro Fastball"
                elif fastball_type == "Four-Seam" or fastball_type == "Inefficient":
                    fastball_type = "Inefficient Fastball"
                else: 
                    fastball_type = "Sinker"
            elif vb >= 11 and vb <= 15:
                if fastball_type == "Cutter": 
                    fastball_type = "Standard Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Runner"
            else: 
                if fastball_type == "Cutter": 
                    fastball_type = "Riding-Cutters"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Riders"
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
    
        def fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB):
            vel = fastball_avg_velo
            hb = fastball_avg_HB
            vb = fastball_avg_VB
        
            #Pitch-Velo Classification
            if vel < 84: 
                fastball_velo = ("Below Average")
            elif vel >= 84 and vel <= 86:
                fastball_velo = ("Average")
            else: 
                fastball_velo = ("Elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 9:
                fastball_type = ("Inefficient")
            elif abs(hb) > 9 and abs(hb) < 15: 
                fastball_type = "Four-Seam"
            else:
                fastball_type = ("Two-Seam")
            

            #Pitch Type - VB Classification
            if vb < 11: 
                if fastball_type == "Cutter": 
                    fastball_type = "Gyro Fastball"
                elif fastball_type == "Four-Seam" or fastball_type == "Inefficient":
                    fastball_type = "Inefficient Fastball"
                else: 
                    fastball_type = "Sinker"
            elif vb >= 11 and vb <= 15:
                if fastball_type == "Cutter": 
                    fastball_type = "Standard Cutter"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Dead-Zone Fastball"
                else: 
                    fastball_type = "Runner"
            else: 
                if fastball_type == "Cutter": 
                    fastball_type = "Riding-Cutters"
                elif fastball_type == "Four-Seam":
                    fastball_type = "Riders"
                else: 
                    fastball_type = "Ride-Run Fastball"
        
            profile = f"{fastball_type} with a velocity of {round(vel, 1)} mph which is {fastball_velo}." 
            return profile
    
        return {
            "Velocity": round(fastball_avg_velo, 1),
            "VB": round(fastball_avg_VB, 1),
            "HB": round(fastball_avg_HB, 1), 
            "Profile": fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB)
        }
