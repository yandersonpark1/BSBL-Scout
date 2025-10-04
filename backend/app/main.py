from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from app.api import routes_upload, routes_analysis

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    # only origin can make request to backend 
    allow_origins=["https://localhost:5173"], 
    allow_credentials=True, 
    #all HTTP methods allowed
    allow_methods = ["*"],
    # any headers allowed 
    allow_headers = ["*"],
)

#registers router, prefix - all routes defined in routes_upload module live in path /x, tags - tags route under "x" in docs
app.include_router(routes_upload.router, prefix="/upload", tags=["Upload"])
app.include_router(routes_analysis.router, prefix="/analysis", tags=["Analysis"])