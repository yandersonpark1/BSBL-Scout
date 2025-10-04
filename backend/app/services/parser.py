import io, csv
import pandas as pd 

from app.database.db_connect import collection 

async def handle_upload(file):
    file_contents = await file.read()
    decoded = file_contents.decode('utf-8')
    
    reader = csv.DictReader(io.StringIO(decoded))
    data = [row for row in reader]
    
    if not data: 
        return {"message": "No data found in the CSV file."}
    
    # creates document for upload with filename as data entry point in DB and pitches as array of rows of data in csv
    doc = {"filename": file.filename, "pitches": data}
    result = collection.insert_one(doc)
    
    # message - message, inserted_id - id of document can be used later for analysis for unique file, rows_inserted - number of rows in csv
    return{
        "message": "File uploaded successfully", 
        "inserted_id": str(result.inserted_id), 
        "rows_inserted": len(data)
    }