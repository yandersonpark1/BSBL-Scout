#Entry point for FastAPI application
from fastapi import FastAPI, UploadFile, File, HTTPException
from database.db_connect import db
from scripts.pipeline import pipeline

app = FastAPI()

@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...)): 
    #Ensuring the uploaded file is a CSV
    if not file.filename.endswith('.csv'):
        return HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    # Read file contents 
    file_contents = await file.read()
    
    # Run analysis 
    # results = pipeline(file_contents, file.filename)
    
    # Save raw data and results to database
    db.insert_one({"filename": file.filename, "results": file_contents})
    
    #User Response 
    return {"message": "File uploaded succesffully", "results": results}