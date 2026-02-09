#API router - lets grouping of related endpoints, UploadFile - handles FastAPI helper class for handling uplaoded file, File - tells FASTAPI should be file, HTTPException - raises HTTP exception with status code and detail message
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.services import parser
from app.schemas.upload_schema import UploadResponse
from app.database.db_connect import get_db

#router creates object to define endpoints
router = APIRouter()

#api endpoint - /upload/pitch_data_csv, response_model - response validated and serialized using UploadResponse schema
@router.post("/pitch_data_csv", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .csv files are allowed.")

    #calls handle_upload function from parser module to process uploaded file
    result = await parser.handle_upload(file, db)

    return result