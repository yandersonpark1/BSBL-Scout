import pandas as pd
import io

def clean_rapsodo_csv(file_like):
    file_like.seek(0)
    first_line = file_like.readline().decode("utf-8").strip()

    # Already cleaned
    if first_line.startswith("Date,No,Pitch Type"):
        file_like.seek(0)
        return pd.read_csv(file_like)

    # Reset pointer and extract metadata
    file_like.seek(0)
    player_id_line = file_like.readline().decode("utf-8").strip().split(",")
    player_name_line = file_like.readline().decode("utf-8").strip().split(",")

    player_id = player_id_line[1].replace('"', '')
    player_name = player_name_line[1].replace('"', '').replace(" ", "_")

    # Read the rest of the file as DataFrame
    df = pd.read_csv(file_like, skiprows=2)

    # Normalize column names (strip whitespace)
    df.columns = df.columns.str.strip()

    keep_cols = [
        "Date","No","Pitch Type","Is Strike","Velocity","Total Spin",
        "Spin Efficiency (release)","Spin Direction",
        "VB (trajectory)","HB (trajectory)",
        "Release Height","Release Side"
    ]

    # Keep only available columns (ignore missing ones instead of erroring)
    missing = [c for c in keep_cols if c not in df.columns]
    if missing:
        print(f"⚠️ Missing columns in CSV: {missing}")

    df = df[[c for c in keep_cols if c in df.columns]]

    # Add metadata
    df["Player ID"] = player_id
    df["Player Name"] = player_name

    # Normalize dates
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce").dt.strftime("%m/%d/%Y")

    return df
