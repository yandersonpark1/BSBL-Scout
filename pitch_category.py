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
    
        def fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB):
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
            "Profile": fastballAvgClassify(fastball_avg_velo, fastball_avg_VB, fastball_avg_HB)
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
    
    def changeupFile(self): 
        #initialize variables
        CH_velo, CH_VB, CH_HB = 0, 0, 0
        CH_velo_profile, CH_VB_profile, CH_HB_profile = "", "", ""
        CH_profile, profile = "", ""
        
        fastball_average = self.fastballAverage()
        
        #Sets variables to fastball average
        for key, value in fastball_average.items():
            if key == "Velocity":
                CH_velo = value
            elif key == "VB":
                CH_VB = value
            elif key == "HB":
                CH_HB = value
    
        #Reads file
        df = pd.read_csv(self.file, usecols = self.importantValues())
        df_CH = df.copy()
    
        #Cleans data and looks for Changeups
        df_CH = df_CH[df_CH["Pitch Type"].str.contains("ChangeUp", na=False)]
    
        df_CH["Velocity"] = pd.to_numeric(df_CH["Velocity"], errors='coerce')
        df_CH["VB (trajectory)"] = pd.to_numeric(df_CH["VB (trajectory)"], errors='coerce')
        df_CH["HB (trajectory)"] = pd.to_numeric(df_CH["HB (trajectory)"], errors='coerce')
        df_CH = df_CH.dropna()
        
        def ChangeUpClassifyFile(row):
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
        
            #Pitch-Velo Classification/ Need to classify velocity depending on FB
            
            #CH Classification based on Velo 
            if CH_velo - vel < 6:
                CH_velo_profile = ("Firm")
            elif CH_velo - vel >= 6 and CH_velo - vel <= 9:
                CH_velo_profile = ("Standard")
            elif CH_velo - vel > 9:
                CH_velo_profile = ("Parachute")
            
            #CH classification based on HB
            if CH_HB - abs(hb) < 6:
                CH_HB_profile = ("Standard") 
            else: 
                CH_HB_profile = ("Shuuto")
            
            #CH Type - VB Classification
            if CH_VB - vb <= 5: 
                CH_VB_Profile = "CopyCat"
            elif CH_VB - vb > 5 and CH_VB - vb <= 10:
                CH_VB_Profile = "Standard"    
            else:
                CH_VB_Profile = "Dropper"

            CH_profile = CH_velo_profile + " " + CH_HB_profile + " " + CH_VB_Profile
            
            profile = f"{CH_profile} with a velocity of {vel} mph which is {CH_velo}." 
            return profile
    
        #Applies classification to dataframe
        df_CH[profile] = df_CH.apply(ChangeUpClassifyFile, axis=1)
        return df_CH[profile]
    
    def changeupAverage(self): 
        #initialize variables
        CH_velo, CH_VB, CH_HB = 0, 0, 0
        CH_velo_profile, CH_VB_profile, CH_HB_profile = "", "", ""
        CH_profile, profile = "", ""
    
        fastball_average = self.fastballAverage()
        
        #Sets variables to fastball average
        for key, value in fastball_average.items():
            if key == "Velocity":
                CH_velo = value
            elif key == "VB":
                CH_VB = value
            elif key == "HB":
                CH_HB = value
                
        #Reads file
        df = pd.read_csv(self.file, usecols = self.importantValues())
        df_ch = df.copy()
    
    
        #Cleans data and looks for fastballs (Need to Change 2S, CT to exact value)
        df_ch = df_ch[df_ch["Pitch Type"].str.contains("ChangeUp")]
    
        df_ch["Velocity"] = pd.to_numeric(df_ch["Velocity"], errors='coerce')
        df_ch["VB (trajectory)"] = pd.to_numeric(df_ch["VB (trajectory)"], errors='coerce')
        df_ch["HB (trajectory)"] = pd.to_numeric(df_ch["HB (trajectory)"], errors='coerce')
        df_ch = df_ch.dropna()
    
        changeup_avg_velo = df_ch["Velocity"].mean()
        changeup_avg_VB = df_ch["VB (trajectory)"].mean()
        changeup_avg_HB = df_ch["HB (trajectory)"].mean()
    
        def changeupAvgClassify(changeup_avg_velo, changeup_avg_VB, changeup_avg_HB):
            vel = round(changeup_avg_velo, 1)
            hb = changeup_avg_HB
            vb = changeup_avg_VB
        
            #Pitch-Velo Classification
            if CH_velo - vel < 6:
                CH_velo_profile = ("Firm")
            elif CH_velo - vel >= 6 and CH_velo - vel <= 9:
                CH_velo_profile = ("Standard")
            elif CH_velo - vel > 9:
                CH_velo_profile = ("Parachute")
            
            #CH classification based on HB
            if CH_HB - abs(hb) < 6:
                CH_HB_profile = ("Standard") 
            else: 
                CH_HB_profile = ("Shuuto")
            
            #CH Type - VB Classification
            if CH_VB - vb <= 5: 
                CH_VB_Profile = "CopyCat"
            elif CH_VB - vb > 5 and CH_VB - vb <= 10:
                CH_VB_Profile = "Standard"    
            else:
                CH_VB_Profile = "Dropper"

            CH_profile = CH_velo_profile + " " + CH_HB_profile + " " + CH_VB_Profile
            
            profile = f"{CH_profile} with a velocity of {vel}." 
            return profile
    

        return {
            "Velocity": round(changeup_avg_velo, 1),
            "VB": round(changeup_avg_VB, 1),
            "HB": round(changeup_avg_HB, 1), 
            "Profile": changeupAvgClassify(changeup_avg_velo, changeup_avg_VB, changeup_avg_HB)
        }

def main(): 
    file = input ("Enter the file name (with .csv extension): ")  # change this if the file is named differently
    run_file = pitch_category(file)
    
    
    while True: 
        print("\n 1. Run all the Pitches \n 2. Run Fastballs Only \n 3. Run Changeups Only \n 4. Run Sliders Only \n 5. Show me Fastball Average and Profile \n 6. Show me Changeup Avergae and Profile \n 7. Show me Pitch Visual. \n 8. Exit")
        
        option = input("Enter your choice: ")
        
        #Runs all Pitches 
        if option == "1": 
            print((run_file.cleanData()))
        #Runs only Fastballs
        elif option == "2": 
            print(run_file.fastballFile())
        #Runs only Changeups
        elif option == "3": 
            print(run_file.changeupFile())
        #Runs only Sliders
        elif option == "4": 
            print(run_file.sliderFile())
        #Runs Fastball Averages
        elif option == "5": 
            avg_fastball = run_file.fastballAverage()
            print("Fastball Averages:")
            for key, value in avg_fastball.items():
                print(f"{key}: {value}")
        #Runs Changeup Averages
        elif option == "6":   
            avg_changeup = run_file.changeupAverage()
            print("Changeup Averages:")
            for key, value in avg_changeup.items():
                print(f"{key}: {value}")
        #Runs Pitch Visual
        elif option == "7":     
            ScatterPlot(file)
        #Exits
        elif option == "8": 
            print("Exiting the program.")
            break
        #Invalid option entered
        else: 
            print("Invalid option. Please try again.")
    

if __name__ == "__main__":
    main()
