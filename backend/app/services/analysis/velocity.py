import pandas as pd 
#ObjectId to query MongoDB documents by their unique IDs
from bson import ObjectId

from app.database.db_connect import collection

#We can add each pitch individually later - add to dictionary return value
def analyze_velocity(file_id: str):
    # doc -type {str, any} - {filename: x, pitches: [ {pitch_type: a, velocity: b}, {...},]}
    doc = collection.find_one({"_id": ObjectId(file_id)})
    
    if not doc: 
        return {"error": "File not found"}
    
    df = pd.DataFrame(doc['pitches'])
    
    if 'Velocity' not in df.columns or 'Pitch Type' not in df.columns:
        return {"error": "Required columns are missing in the data"}

    # converts Velocity to numeric, if not NaN
    df['Velocity'] = pd.to_numeric(df['Velocity'], errors='coerce') 
    
    #grouped - Series with Pitch_Type as index and mean Velocity as values
    #.groupby (type)[value].aggregate
    grouped = df.groupby('Pitch Type')['Velocity'].mean().reset_index()
    
    #results - list of dicts - [{Pitch_Type: x, Velocity: y}, {...}, ...]
    results = grouped.to_dict(orient='records')
    
    #returns {filename: x, average_velocities: [{Pitch_Type: x, Velocity: y}, {...}, ...]}
    return {
        "filename": doc['filename'],
        "average_velocities": results
    }