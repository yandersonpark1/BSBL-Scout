import pandas as pd 
import plotly.express as px
from data_visual import ScatterPlot


#Changeup will need to use Deviations Based on Fastball
    #creates File for only changeup data for Rapsodo#
        #Changeup Profiles 
            #Avg Deviations - Velo (8mph), VB (8 in), HB (3.5 in) 
            #Velocity Deviation; <6: Firm, 6-9: Standard, > 9: Parachute 
                #Firm and Standard GB; Parachute Whiffs
            #VB Deviation; <= 5: Copycat, 5-10: Standard, > 10: Dropper
                #Firm Droppers (GB)
                #Parachute Dropper - Airbender 
                    # Seam orientation typically around 2:30 or more 
                #Typically with big VB deviations also comes high HB deviations
            #HB Deviation; <6: Standard, >=6 Shuuto
        #Notes 
            #Typically Changeups with 4Seam FBs will grade Higher 
            #Changeup with 2S/Sinkers FBs will grade lower
            #Firm Copycats should be avoided
            #Either two categories should be elite or one should be elite and the other should be standard
            #BugsBunny Changeup: Changeup with >9 mph difference with standard and copycat mvmt (plays well)

class ClassifyChangeup:
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
        
        self.CH_velo = self.df_fb["Velocity"].mean()
        self.CH_VB = self.df_fb["VB (trajectory)"].mean()
        self.CH_HB = self.df_fb["HB (trajectory)"].mean()

        """Create Chanegup Dataframe"""
        self.df_CH = self.df[self.df["Pitch Type"].str.contains("ChangeUp", na=False)]
    
        self.df_CH["Velocity"] = pd.to_numeric(self.df_CH["Velocity"], errors='coerce')
        self.df_CH["VB (trajectory)"] = pd.to_numeric(self.df_CH["VB (trajectory)"], errors='coerce')
        self.df_CH["HB (trajectory)"] = pd.to_numeric(self.df_CH["HB (trajectory)"], errors='coerce')
        self.df_CH = self.df_CH.dropna()
        
        #Changeup attributes
        self.CH_velo_profile, self.CH_VB_profile, self.CH_HB_profile = "", "", ""
        self.CH_profile, self.profile = "", ""
    
        
    def changeupFile(self): 
        #Sets variables to fastball average
        def ChangeUpClassifyFile(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
        
            #Pitch-Velo Classification/ Need to classify velocity depending on FB
            #CH Classification based on Velo 
            if self.CH_velo - vel < 6:
                self.CH_velo_profile = ("Firm")
            elif self.CH_velo - vel >= 6 and self.CH_velo - vel <= 9:
                self.CH_velo_profile = ("Standard")
            elif self.CH_velo - vel > 9:
                self.CH_velo_profile = ("Parachute")
            
            #CH classification based on HB
            if self.CH_HB - abs(hb) < 6:
                self.CH_HB_profile = ("Standard") 
            else: 
                self.CH_HB_profile = ("Shuuto")
            
            #CH Type - VB Classification
            if self.CH_VB - vb <= 5: 
                self.CH_VB_profile = "CopyCat"
            elif self.CH_VB - vb > 5 and self.CH_VB - vb <= 10:
                self.CH_VB_profile = "Standard"    
            else:
                self.CH_VB_profile = "Dropper"

            self.CH_profile = self.CH_velo_profile + " " + self.CH_HB_profile + " " + self.CH_VB_profile
            
            profile = f"{self.CH_profile} with a velocity of {vel} mph which is {self.CH_velo}." 
            return profile
    
        #Applies classification to dataframe
        self.df_CH["Profile"] = self.df_CH.apply(ChangeUpClassifyFile, axis=1)
        return self.df_CH["Profile"]
    
    def changeupAverage(self): 
        
        changeup_avg_velo = self.df_CH["Velocity"].mean()
        changeup_avg_VB = self.df_CH["VB (trajectory)"].mean()
        changeup_avg_HB = self.df_CH["HB (trajectory)"].mean()
    
        def changeupAvgClassify(changeup_avg_velo, changeup_avg_VB, changeup_avg_HB):
            vel = round(changeup_avg_velo, 1)
            hb = changeup_avg_HB
            vb = changeup_avg_VB
        
            #Pitch-Velo Classification
            if self.CH_velo - vel < 6:
                self.CH_velo_profile = ("Firm")
            elif self.CH_velo - vel >= 6 and self.CH_velo - vel <= 9:
                self.CH_velo_profile = ("Standard")
            elif self.CH_velo - vel > 9:
                self.CH_velo_profile = ("Parachute")
            
            #CH classification based on HB
            if self.CH_HB - abs(hb) < 6:
                self.CH_HB_profile = ("Standard") 
            else: 
                self.CH_HB_profile = ("Shuuto")
            
            #CH Type - VB Classification
            if self.CH_VB - vb <= 5: 
                self.CH_VB_profile = "CopyCat"
            elif self.CH_VB - vb > 5 and self.CH_VB - vb <= 10:
                self.CH_VB_profile = "Standard"    
            else:
                self.CH_VB_profile = "Dropper"

            self.CH_profile = self.CH_velo_profile + " " + self.CH_HB_profile + " " + self.CH_VB_profile
            
            profile = f"{self.CH_profile} with a velocity of {vel}." 
            return profile
    

        return {
            "Velocity": round(changeup_avg_velo, 1),
            "VB": round(changeup_avg_VB, 1),
            "HB": round(changeup_avg_HB, 1), 
            "Profile": changeupAvgClassify(changeup_avg_velo, changeup_avg_VB, changeup_avg_HB)
        }

def main(): 
    file = input ("Enter the file name (with .csv extension): ")  
    run_filename = ClassifyChangeup(file)
    
    """Individual Changeup Pitches"""
    print(run_filename.changeupFile())
    
    """Changeup Average"""
    changeup_avg = run_filename.changeupAverage()
    print("Changeup Average: ", changeup_avg)
    
if __name__ == "__main__":
    main()