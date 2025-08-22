import pandas as pd

def load_rapsodo_csv(file_path, output_path="processed/filtered.csv"):
    # Step 1: Read metadata (first two lines before the header row)
    with open(file_path, "r", encoding="utf-8") as f:
        player_id_line = f.readline().strip().split(",")
        player_name_line = f.readline().strip().split(",")
    
    player_id = player_id_line[1].replace('"', '')
    player_name = player_name_line[1].replace('"', '')

    # Step 2: Load CSV, skipping first two lines
    df = pd.read_csv(file_path, skiprows=2)

    # Step 3: Filter desired columns
    keep_cols = [
        "No",
        "Pitch Type",
        "Is Strike",
        "Velocity",
        "Total Spin",
        "Spin Efficiency (release)",
        "Spin Direction",
        "VB (trajectory)",
        "HB (trajectory)",
        "Release Height",
        "Release Side"
    ]
    df = df[keep_cols]

    # Step 4: Attach player metadata
    df["Player ID"] = player_id
    df["Player Name"] = player_name

    # Step 5: Save cleaned file
    df.to_csv(output_path, index=False)
    print(f"Filtered CSV saved to {output_path}")
    return df

def main(): 
    file_path = input("Enter the path to the Rapsodo CSV file: ")
    output_path = input("Enter the output path for the filtered CSV (default: processed/filtered.csv): ") or "processed/filtered.csv"
    load_rapsodo_csv(file_path, output_path)
