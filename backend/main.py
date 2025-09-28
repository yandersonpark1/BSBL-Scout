# Entry point for FastAPI application
from fastapi import FastAPI, UploadFile, File, HTTPException
from backend.database.db_connect import collection
from fastapi.middleware.cors import CORSMiddleware

import io
import csv

app = FastAPI()

# for testing locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)): 
    # Ensure the uploaded file is a CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    # Read file contents
    file_contents = await file.read()
    decoded = file_contents.decode("utf-8")

    # Parse CSV → list of dicts
    reader = csv.DictReader(io.StringIO(decoded))
    rows = [row for row in reader]  # each row is a dict

    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    # Insert into MongoDB: one document per upload, pitches as array
    doc = {
        "filename": file.filename,
        "pitches": rows
    }
    result = collection.insert_one(doc)

    # Response to client
    return {
        "message": "File uploaded successfully",
        "inserted_id": str(result.inserted_id),
        "rows_inserted": len(rows)
    }
