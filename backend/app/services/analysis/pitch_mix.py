import pandas as pd 
#ObjectId to query MongoDB documents by their unique IDs
from bson import ObjectId

from app.database.db_connect import collection

async def analyze_pitch_mix(file_id: str):
    # doc -type {str, any} - {filename: x, pitches: [ {pitch_type: a, velocity: b}, {...},]}
    doc = collection.find_one({"_id": ObjectId(file_id)})
    
    if not doc: 
        return {"error": "File not found"}
    
    df = pd.DataFrame(doc['pitches'])
    
    required_cols = ["Pitch Type", "VB (trajectory)", "HB (trajectory)"]
    for col in required_cols:
        if col not in df.columns:
            return {"error": f"CSV missing required column: {col}"}
    
    df['VB (trajectory)'] = pd.numeric(df['VB (trajectory)'], errors='coerce')
    df['HB (trajectory)'] = pd.numeric(df['HB (trajectory)'], errors='coerce')
    
    df = df.dropna(subset=["VB (trajectory)", 'HB (trajectory)', "pitch_type"])
    
    results = df[["pitch_type", 'VB (trajectory)', 'HB (trajectory)']].to_dict(orient="records")

    return {
        "filename": doc["filename"],
        "pitch_mix": results
    }

    
    
    