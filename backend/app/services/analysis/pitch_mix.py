import pandas as pd 
#ObjectId to query MongoDB documents by their unique IDs
from bson import ObjectId

from app.database.db_connect import collection

def analyze_pitch_mix(file_id: str):
    # doc -type {str, any} - {filename: x, pitches: [ {pitch_type: a, velocity: b}, {...},]}
    doc = collection.find_one({"_id": ObjectId(file_id)})
    
    if not doc: 
        return {"error": "File not found"}
    
    df = pd.DataFrame(doc['pitches'])
    
    required_cols = ["Pitch Type", "VB (trajectory)", "HB (trajectory)"]
    for col in required_cols:
        if col not in df.columns:
            return {"error": f"CSV missing required column: {col}"}
    
    df['VB (trajectory)'] = pd.to_numeric(df['VB (trajectory)'], errors='coerce')
    df['HB (trajectory)'] = pd.to_numeric(df['HB (trajectory)'], errors='coerce')
    
    df = df.dropna(subset=["VB (trajectory)", 'HB (trajectory)', "Pitch Type"])
    
    # Rename for API schema compatibility
    df = df.rename(columns={"Pitch Type": "pitch_type"})
    
    results = df[["pitch_type", 'VB (trajectory)', 'HB (trajectory)']].to_dict(orient="records")

    return {
        "filename": doc["filename"],
        "pitch_mix": results
    }

    
    
    