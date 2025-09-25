#Entry point for FastAPI application
from fastapi import FastAPI, UploadFile, File, HTTPException
from backend.database.db_connect import collection
# from backend.scripts.pipeline import pipeline
#for testing locally
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

#for testing locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)): 
    #Ensuring the uploaded file is a CSV
    if not file.filename.endswith('.csv'):
        return HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    # Read file contents 
    file_contents = await file.read()
    
    # Run analysis 
    # results = pipeline(file_contents, file.filename)
    
    # Save raw data and results to database
    collection.insert_one({"filename": file.filename, "results": file_contents})
    
    #User Response 
    return {"message": "File uploaded succesffully"}