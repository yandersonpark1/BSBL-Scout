import pandas as pd 
import plotly.express as px
from data_visual import ScatterPlot    

class ClassifySlider:
    def __init__(self, file):
        #Reads file
        self.df = pd.read_csv(file)
        
        """Data for Fastball average to compare changeups"""
        #Cleans data and looks for fastballs (Need to Change 2S, CT to exact value)
        self.df_fb = self.df[self.df["Pitch Type"].str.contains("Fastball|2S|Ct", case = False, na=False, regex = True)]
        self.df_fb = self.df_fb.dropna()
        
        #numerizes values
        self.df_fb["Velocity"] = pd.to_numeric(self.df_fb["Velocity"], errors='coerce')
        self.df_fb["VB (trajectory)"] = pd.to_numeric(self.df_fb["VB (trajectory)"], errors='coerce')
        self.df_fb["HB (trajectory)"] = pd.to_numeric(self.df_fb["HB (trajectory)"], errors='coerce')
        self.df_fb = self.df_fb.dropna()
        
        self.fastball_velo = self.df_fb["Velocity"].mean()

        """Create Slider Dataframe"""
        self.slider_velo_profile = ""
        self.slider_type_profile = ""
        self.profile = ""
        
        self.df_sl = self.df[self.df["Pitch Type"].str.contains("Slider", na=False)].copy()
    
        self.df_sl["Velocity"] = pd.to_numeric(self.df_sl["Velocity"], errors='coerce')
        self.df_sl["VB (trajectory)"] = pd.to_numeric(self.df_sl["VB (trajectory)"], errors='coerce')
        self.df_sl["HB (trajectory)"] = pd.to_numeric(self.df_sl["HB (trajectory)"], errors='coerce')
        self.df_sl = self.df_sl.dropna()
        
    
    
    #Data Buckets for Sliders
    #Cutter - (Velo (5-7 less than primary pitch)), VB (7-11), |HB| < 5
        #Look to Throw Hardest Slider
        #Needs to be Firm with Command 
    #Slutter - (Velo (Typically 6-8 ticks less than primary pitch)), VB (1-7), |HB| < 5
       #Typically More Gyro Spin than Cutter` 
       #Typically still behind the ball
    #Gyro Slider - Velo (Typically 9-11 off primary pitch), VB (-2, 2), |HB| < 5
        #Smallest Movement Profile 
    #Standard Slider - Velo (Typically 9-11 off primary pitch), VB (-2,5), 11 > |HB| > 5
        #Increase Side Spin 
        #Very Similar to Gyro But adds mini Sweep Component
    #Sweeper - Velo (Typically 11-14 off primary pitch), VB (-2,5), |HB| > 11
        #Higher Spin Rates
    #Slurve - Velo (Typically 11-14 off primary pitch), VB < -3, |HB| > 11
        #Slurves typically are Sweepers with More depth killing Horizontal 
    
    #creates File for only slider data for Rapsodo
    def sliderFile(self): 
        def sliderClassifyFile(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]

            #Pitch Velocity depending on fastball
            slider_velo = self.fastball_velo - vel
        
            #Pitch type classification 
            if abs(hb) <= 5:
                slider_type = ("Cutter") 
            elif abs(hb) > 5 and abs(hb) <= 11:
                slider_type = ("Slider")
            else: 
                slider_type = "Sweeper"
            
            #Pitch Type - VB Classification
            if 7 <= vb <= 11: 
                if slider_type == "Cutter": 
                    slider_type = "Cutter"
                elif slider_type == "Slider":
                    slider_type = "Standard Slider"
                else: 
                    slider_type = "Sweeper"
            elif 1 >= vb > 7:
                if slider_type == "Cutter": 
                    slider_type = "Slutter"
        
            profile = f"{slider_type} with a velocity of {vel} mph which is {slider_velo}." 
            return profile
    
        #Applies classification to dataframe
        self.df_sl["Profile"] = self.df_sl.apply(sliderClassifyFile, axis=1)
        return self.df_sl["Profile"]

def main(): 
    file = input ("Enter the file name (with .csv extension): ")  # change this if the file is named differently
    run_filename = ClassifySlider(file)
    
    #Run Indiviudal Pitches
    print(run_filename.sliderFile())
    
    
if __name__ == "__main__":
    main()