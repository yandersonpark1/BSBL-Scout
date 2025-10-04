from pydantic import BaseModel 

#class UploadRequest(BaseModel) checking if uploaded csv returns valid response
class UploadResponse(BaseModel): 
    message: str 
    filename: str
    rows_inserted: int
    