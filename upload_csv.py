from db_connect import db
import pandas as pd
from collections import defaultdict
from datetime import datetime
import os

players_collection = db["players"]

def upload_clean_csv_to_mongodb(path, players_collection):
    if not os.path.isfile(path):
        print(f"❌ {path} is not a valid CSV file")
        return

    print(f"Processing cleaned file: {path}")

    # Read cleaned CSV (assumes player_id and player_name are included in the file)
    df = pd.read_csv(path)

    if "player_id" not in df.columns or "player_name" not in df.columns:
        print("❌ CSV must contain 'player_id' and 'player_name' columns")
        return

    player_id = int(df["player_id"].iloc[0])
    player_name = df["player_name"].iloc[0]

    # Group pitches by date
    sessions = defaultdict(list)
    for _, row in df.iterrows():
        date_str = row["Date"]
        # Assumes already cleaned into YYYY-MM-DD, else adjust format
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            date_obj = datetime.strptime(date_str, "%a %b %d %Y")
        session_date = date_obj.strftime("%Y-%m-%d")

        pitch_data = row.drop(labels=["Date", "player_id", "player_name"]).to_dict()
        sessions[session_date].append(pitch_data)

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

    print(f"✅ Uploaded cleaned data for player {player_name} ({player_id})")

def main():
    file_path = input("Enter the path to the cleaned Rapsodo CSV file: ").strip()
    upload_clean_csv_to_mongodb(file_path, players_collection)

if __name__ == "__main__":
    main()
