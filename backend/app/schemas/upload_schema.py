from pydantic import BaseModel 

#class UploadRequest(BaseModel) checking if uploaded csv returns valid response
class UploadResponse(BaseModel): 
    message: str 
    inserted_id: str
    rows_inserted: int
    