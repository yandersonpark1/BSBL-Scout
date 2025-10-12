import pandas as pd
import sys

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
class ClassifySlider:
    def __init__(self, file_or_df):
        # Reads file
        if isinstance(file_or_df, str):
            self.df = pd.read_csv(file_or_df)
        elif isinstance(file_or_df, pd.DataFrame):
            self.df = file_or_df.copy()
        else:
            raise ValueError("Input must be a file path or pandas DataFrame.")
        
        # Fastball data for reference
        self.df_fb = self.df[self.df["Pitch Type"].str.contains("Fastball", case=False, na=False, regex=True)].copy()
        self.df_fb.loc[:, "Velocity"] = pd.to_numeric(self.df_fb["Velocity"], errors="coerce")
        self.df_fb.loc[:, "VB (trajectory)"] = pd.to_numeric(self.df_fb["VB (trajectory)"], errors="coerce")
        self.df_fb.loc[:, "HB (trajectory)"] = pd.to_numeric(self.df_fb["HB (trajectory)"], errors="coerce")
        self.df_fb = self.df_fb.dropna()

        self.fastball_velo = self.df_fb["Velocity"].mean() if not self.df_fb.empty else None

        # Slider dataframe
        self.df_sl = self.df[self.df["Pitch Type"].str.contains("Slider|Curveball|Cutter", case=False, na=False, regex=True)].copy()
        self.df_sl.loc[:, "Velocity"] = pd.to_numeric(self.df_sl["Velocity"], errors="coerce")
        self.df_sl.loc[:, "VB (trajectory)"] = pd.to_numeric(self.df_sl["VB (trajectory)"], errors="coerce")
        self.df_sl.loc[:, "HB (trajectory)"] = pd.to_numeric(self.df_sl["HB (trajectory)"], errors="coerce")
        self.df_sl = self.df_sl.dropna()

    def _classify_slider(self, vel, hb, vb):
        """Classify a single slider pitch based on velo, hb, vb and fastball reference"""
        if self.fastball_velo is None:
            return "No fastball reference"

        velo_diff = self.fastball_velo - vel

        # Initial bucket by HB
        if abs(hb) <= 4:
            slider_type = "Cutter"
        elif 4 < abs(hb) <= 12:
            slider_type = "Slider"
        else:
            slider_type = "Sweeper"

        # Refine classification by VB
        if slider_type == "Cutter":
            if 5 <= vb <= 10:
                slider_type = "Cutter"
            elif 3 <= vb < 5:
                slider_type = "Slutter"
            elif -6 <= vb < 3:
                slider_type = "Gyro Slider"
            else:
                slider_type = "Curveball"

        elif slider_type == "Slider":
            if -6 <= vb <= 6:
                slider_type = "Standard Slider"
            elif vb > 6:
                slider_type = "Error"
            else:
                slider_type = "Slurve"

        elif slider_type == "Sweeper":
            if vb > 5:
                slider_type = "Error"
            elif -6 <= vb <= 5:
                slider_type = "Sweeper"
            else:
                slider_type = "Slurve"

        return f"{slider_type} at {vel:.1f} mph ({velo_diff:+.1f} mph diff from FB)"

    def sliderFile(self):
        """Return structured classification for each slider pitch"""
        results = []
        for _, row in self.df_sl.iterrows():
            vel = row["Velocity"]
            hb = row["HB (trajectory)"]
            vb = row["VB (trajectory)"]
            profile = self._classify_slider(vel, hb, vb)
            results.append({
                "Velocity": round(vel, 1),
                "HB": round(hb, 1),
                "VB": round(vb, 1),
                "Profile": profile
            })
        return results

    def sliderAverage(self):
        """Return average classification across all sliders"""
        if self.df_sl.empty:
            return {}

        avg_vel = self.df_sl["Velocity"].mean()
        avg_hb = self.df_sl["HB (trajectory)"].mean()
        avg_vb = self.df_sl["VB (trajectory)"].mean()
        profile = self._classify_slider(avg_vel, avg_hb, avg_vb)

        return {
            "Velocity": round(avg_vel, 1),
            "HB": round(avg_hb, 1),
            "VB": round(avg_vb, 1),
            "Profile": profile
        }


def main(file):
    """Test script for local runs"""
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

    classifier = ClassifySlider(df)

    print("Individual Slider Pitches:")
    for pitch in classifier.sliderFile():
        print(pitch)

    print("\nSlider Average:")
    print(classifier.sliderAverage())


if __name__ == "__main__":
    main("your_file.csv")
