from db_connect import db
import pandas as pd
from collections import defaultdict
from datetime import datetime
import glob

players_collection = db["players"]

csv_folder = "Kaes.csv"

for csv_file in glob.glob(csv_folder):
    print(f"Processing file: {csv_file}")

    # Example: metadata in first two rows
    meta_df = pd.read_csv(csv_file, nrows=2, header=None)
    player_id = int(meta_df.iloc[0, 1])
    player_name = meta_df.iloc[1, 1]

    # Pitch data starts after metadata rows
    df = pd.read_csv(csv_file, skiprows=3)

    # Group pitches by date
    sessions = defaultdict(list)
    for _, row in df.iterrows():
        date_str = " ".join(row["Date"].split()[0:4])
        date_obj = datetime.strptime(date_str, "%a %b %d %Y")
        session_date = date_obj.strftime("%Y-%m-%d")
        pitch_data = row.drop(labels=["Date"]).to_dict()
        sessions[session_date].append(pitch_data)

    # Prepare sessions
    sessions_list = [{"date": d, "pitches": p} for d, p in sessions.items()]

    # Insert or update player
    players_collection.update_one(
        {"player_id": player_id},
        {
            "$setOnInsert": {"player_id": player_id, "player_name": player_name},
            "$push": {"sessions": {"$each": sessions_list}}
        },
        upsert=True
    )

    print(f"Uploaded data for player {player_name} ({player_id})")
