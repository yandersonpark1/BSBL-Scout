import pandas as pd
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
    def __init__(self, file_or_df):
        if isinstance(file_or_df, str):
            self.df = pd.read_csv(file_or_df)
        elif isinstance(file_or_df, pd.DataFrame):
            self.df = file_or_df.copy()
        else:
            raise ValueError("Input must be a file path or pandas DataFrame.")
        
        self.df_fb = self.df[self.df["Pitch Type"].str.contains("Fastball|TwoSeamFastball|Cutter", case=False, na=False, regex=True)].dropna()
        
        # numerize safely
        self.df_fb.loc[:, "Velocity"] = pd.to_numeric(self.df_fb["Velocity"], errors="coerce")
        self.df_fb.loc[:, "VB (trajectory)"] = pd.to_numeric(self.df_fb["VB (trajectory)"], errors="coerce")
        self.df_fb.loc[:, "HB (trajectory)"] = pd.to_numeric(self.df_fb["HB (trajectory)"], errors="coerce")
        self.df_fb = self.df_fb.dropna()

    def classify_all(self):
        def classify(row):
            vel, hb, vb = row["Velocity"], row["HB (trajectory)"], row["VB (trajectory)"]

            # velo buckets
            velo_class = "Below Average" if vel < 84 else "Average" if vel <= 86 else "Elite"

            # base type by HB
            if abs(hb) <= 5: pitch_type = "Cutter"
            elif abs(hb) <= 9: pitch_type = "Inefficient"
            elif abs(hb) < 18: pitch_type = "Four-Seam"
            else: pitch_type = "Two-Seam"

            # refine by VB
            if vb < 11:
                if pitch_type == "Cutter": pitch_type = "Gyro Fastball"
                elif pitch_type in ["Four-Seam", "Inefficient"]: pitch_type = "Inefficient Fastball"
                else: pitch_type = "Sinker"
            elif vb <= 18:
                if pitch_type == "Cutter": pitch_type = "Standard Cutter"
                elif pitch_type in ["Four-Seam", "Inefficient"]: pitch_type = "Dead-Zone Fastball"
                else: pitch_type = "Runner"
            else:
                if pitch_type == "Cutter": pitch_type = "Riding Cutter"
                elif pitch_type in ["Four-Seam", "Inefficient"]: pitch_type = "Rider"
                else: pitch_type = "Ride-Run Fastball"

            return {
                "Velocity": vel,
                "VB": vb,
                "HB": hb,
                "Profile": f"{pitch_type} at {vel:.1f} mph ({velo_class})"
            }

        return self.df_fb.apply(classify, axis=1).tolist()

    def classify_average(self):
        avg_vel = self.df_fb["Velocity"].mean()
        avg_vb = self.df_fb["VB (trajectory)"].mean()
        avg_hb = self.df_fb["HB (trajectory)"].mean()
        
        return {
            "Velocity": round(avg_vel, 1),
            "VB": round(avg_vb, 1),
            "HB": round(avg_hb, 1),
            "Profile": self.classify_all()[0]["Profile"] if not self.df_fb.empty else "No fastballs"
        }
