from database.db_connect import db
import pandas as pd
from collections import defaultdict
import os
import glob

players_collection = db["players"]

def upload_cleaned_csv(path, players_collection):
    """Upload one or more cleaned CSV files into MongoDB."""
    
    # Handle a single file or a folder
    if os.path.isfile(path) and path.endswith(".csv"):
        csv_files = [path]
    else:
        csv_files = glob.glob(os.path.join(path, "*.csv"))
    
    if not csv_files:
        print(f"No CSV files found at {path}")
        return

    for csv_file in csv_files:
        print(f"Processing file: {csv_file}")

        df = pd.read_csv(csv_file)

        player_id = int(df["Player ID"].iloc[0])
        player_name = df["Player Name"].iloc[0]

        # Group pitches by date
        sessions = defaultdict(list)
        for _, row in df.iterrows():
            session_date = row["Date"]  # Already cleaned as MM/DD/YYYY
            pitch_data = row.drop(labels=["Date", "Player ID", "Player Name"]).to_dict()
            sessions[session_date].append(pitch_data)

         # Fetch already uploaded session dates for this player
        existing_player = players_collection.find_one({"player_id": player_id}, {"sessions.date": 1})
        existing_dates = {s["date"] for s in existing_player.get("sessions", [])} if existing_player else set()

        # Filter out dates that are already uploaded
        new_sessions_list = [
            {"date": d, "pitches": p} 
            for d, p in sessions.items() if d not in existing_dates
        ]

        if not new_sessions_list:
            print(f"⚠️ All sessions in {csv_file} are already uploaded. Skipping.")
            continue

        # Insert or update player in MongoDB
        players_collection.update_one(
            {"player_id": player_id},
            {
                "$setOnInsert": {"player_id": player_id, "player_name": player_name},
                "$push": {"sessions": {"$each": new_sessions_list}}
            },
            upsert=True
        )

        print(f"✅ Uploaded data for {player_name} ({player_id})")

def main():
    folder_or_file = input("Enter the path to the cleaned CSV file or folder: ").strip()
    upload_cleaned_csv(folder_or_file, players_collection)

if __name__ == "__main__":
    main()