import pandas as pd
import os
import glob
import sys
import shutil

"""Need to add backup feature for data"""
def load_rapsodo_csv(file_path): 
    
    with open(file_path, "r", encoding="utf-8") as f:
        first_line = f.readline().strip()
    
    if first_line.startswith("Date,No,Pitch Type"):
        print(f"File already cleaned: {file_path}")
        return pd.read_csv(file_path)
    
    with open(file_path, "r", encoding="utf-8") as f:
        player_id_line = f.readline().strip().split(",")
        player_name_line = f.readline().strip().split(",")


    player_id = player_id_line[1].replace('"', '')
    player_name = player_name_line[1].replace('"', '').replace(" ", "_")
    
    df = pd.read_csv(file_path, skiprows=2)

    keep_cols = [
        "Date","No","Pitch Type","Is Strike","Velocity","Total Spin",
        "Spin Efficiency (release)","Spin Direction",
        "VB (trajectory)","HB (trajectory)",
        "Release Height","Release Side"
    ]
    df = df[keep_cols]
    df["Player ID"] = player_id
    df["Player Name"] = player_name

    # Convert Date column to MM/DD/YYYY
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.strftime("%m/%d/%Y")
    
    # Overwrite the original file
    df.to_csv(file_path, index=False)
    print(f"Filtered CSV saved (overwritten): {file_path}")
    return df

def main(folder_path= None, player_name = None): 
    if not folder_path:
        folder_path = input("Enter the path to the Rapsodo CSV file or directory: ").strip()
    if not player_name: 
        player_name = input("Enter the player name: ").strip()

    """Checks if player exists in the database"""
    pattern = os.path.join(folder_path, f"{player_name}*.csv")
    valid_files = glob.glob(pattern)

    if not valid_files:
        print(f"No files found for player '{player_name}' in {folder_path}. Exiting.")
        sys.exit(1)

    cleaned_files = []
    # Clean each matching file
    for file in valid_files:
        cleaned_files.append(load_rapsodo_csv(file))
    
    return cleaned_files

if __name__ == "__main__":
    main()

