import pandas as pd 
import plotly.express as px
from data_visual import ScatterPlot
import sys

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
    """Needs file to read data from, and will classify fastballs based on velocity and trajectory."""
    def __init__(self, file_or_df):
        #Reads file
        if isinstance(file_or_df, str):
            self.df = pd.read_csv(file_or_df)
        elif isinstance(file_or_df, pd.DataFrame):
            self.df = file_or_df
        else:
            raise ValueError("Input must be a file path or pandas DataFrame.")
        
        #Cleans data and looks for fastballs (Need to Change 2S, CT to exact value)
        self.df_fb = self.df[self.df["Pitch Type"].str.contains("Fastball|TwoSeamFastball|Cutter", case = False, na=False, regex = True)]
        self.df_fb = self.df_fb.dropna()
       
        #numerizes values
        self.df_fb["Velocity"] = pd.to_numeric(self.df_fb["Velocity"], errors='coerce')
        self.df_fb["VB (trajectory)"] = pd.to_numeric(self.df_fb["VB (trajectory)"], errors='coerce')
        self.df_fb["HB (trajectory)"] = pd.to_numeric(self.df_fb["HB (trajectory)"], errors='coerce')
        self.df_fb = self.df_fb.dropna()
        
        # Fastball attributes
        self.fastball_velo = ""
        self.fastball_type = ""
        self.profile = ""
    
    def fastballPitch(self):
        #Filters through grading fastball
        def ClassifyFastballPitch(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
            #Pitch-Velo Classification
            if vel < 84: 
                self.fastball_velo = ("Below Average")
            elif vel >= 84 and vel <= 86:
                self.fastball_velo = ("Average")
            else: 
                self.fastball_velo = ("Elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                self.fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 9:
                self.fastball_type = ("Inefficient")
            elif abs(hb) > 9 and abs(hb) < 15: 
                self.fastball_type = "Four-Seam"
            else:
                self.fastball_type = ("Two-Seam")
            

            #Pitch Type - VB Classification
            if vb < 11: 
                if self.fastball_type == "Cutter": 
                    self.fastball_type = "Gyro Fastball"
                elif self.fastball_type == "Four-Seam" or self.fastball_type == "Inefficient":
                    self.fastball_type = "Inefficient Fastball"
                else: 
                    self.fastball_type = "Sinker"
            elif vb >= 11 and vb <= 15:
                if self.fastball_type == "Cutter": 
                    self.fastball_type = "Standard Cutter"
                elif self.fastball_type == "Inefficient":
                    self.fastball_type = "Inefficient Fastball"
                elif self.fastball_type == "Four-Seam":
                    self.fastball_type = "Dead-Zone Fastball"
                else: 
                    self.fastball_type = "Runner"
            else: 
                if self.fastball_type == "Cutter" or self.fastball_type == "Inefficient": 
                    self.fastball_type = "Riding-Cutters"
                elif self.fastball_type == "Four-Seam":
                    self.fastball_type = "Riders"
                else: 
                    self.fastball_type = "Ride-Run Fastball"
        
            self.profile = f"{self.fastball_type} with a velocity of {vel} mph which is {self.fastball_velo}." 
            return self.profile
        #Classifies each fastball in the dataframe
        self.df_fb["Profile"] = self.df_fb.apply(ClassifyFastballPitch, axis=1)
        return self.df_fb["Profile"]
    

    def fastballAverage(self): 
        fastball_avg_velo = self.df_fb["Velocity"].mean()
        fastball_avg_VB = self.df_fb["VB (trajectory)"].mean()
        fastball_avg_HB = self.df_fb["HB (trajectory)"].mean()
    
        def fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB):
            vel = fastball_avg_velo
            hb = fastball_avg_HB
            vb = fastball_avg_VB
        
            #Pitch-Velo Classification
            if vel < 84: 
                self.fastball_velo = ("Below Average")
            elif vel >= 84 and vel <= 86:
                self.fastball_velo = ("Average")
            else: 
                self.fastball_velo = ("Elite")
        
            #Pitch type classification - (Cutters, Fastballs, Two-Seams)
            if abs(hb) <= 5:
                self.fastball_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 9:
                self.fastball_type = ("Inefficient")
            elif abs(hb) > 9 and abs(hb) < 15: 
                self.fastball_type = "Four-Seam"
            else:
                self.fastball_type = ("Two-Seam")
            

            #Pitch Type - VB Classification
            if vb < 11: 
                if self.fastball_type == "Cutter": 
                    self.fastball_type = "Gyro Fastball"
                elif self.fastball_type == "Four-Seam" or self.fastball_type == "Inefficient":
                    self.fastball_type = "Inefficient Fastball"
                else: 
                    self.fastball_type = "Sinker"
            elif vb >= 11 and vb <= 15:
                if self.fastball_type == "Cutter": 
                    self.fastball_type = "Standard Cutter"
                elif self.fastball_type == "Four-Seam":
                    self.fastball_type = "Dead-Zone Fastball"
                else: 
                    self.fastball_type = "Runner"
            else: 
                if self.fastball_type == "Cutter": 
                    self.fastball_type = "Riding-Cutters"
                elif self.fastball_type == "Four-Seam":
                    self.fastball_type = "Riders"
                else: 
                    self.fastball_type = "Ride-Run Fastball"
        
            profile = f"{self.fastball_type} with a velocity of {round(vel, 1)} mph which is {self.fastball_velo}." 
            return profile
    
        return {
            "Velocity": round(fastball_avg_velo, 1),
            "VB": round(fastball_avg_VB, 1),
            "HB": round(fastball_avg_HB, 1), 
            "Profile": fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB)
        }


def main(file): 
    """Checks for correct input type"""
    if isinstance(file, str):
        df = pd.read_csv(file)
    elif isinstance(file, pd.DataFrame):
        df = file
    else:
        print("Invalid input. Exiting.")
        sys.exit(1)

    if df.empty:
        print("No data found. Exiting.")
        return None
    
    """runs fastball classification"""
    run_filename = ClassifyFastball(df)
    
    #Run Indiviudal Pitches
    print(run_filename.fastballPitch())
    
    #Run average fastball
    avg_fastball = run_filename.fastballAverage()
    print("Fastball Averages:")
    for key, value in avg_fastball.items():
        print(f"{key}: {value}")
    
if __name__ == "__main__":
    main()