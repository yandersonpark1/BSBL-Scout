from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import routes_upload, routes_analysis
from app.database.db_connect import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle:
    - Startup: Initialize database tables
    - Shutdown: Close database connections
    """
    # Startup
    print("Starting up application...")
    await init_db()
    yield
    # Shutdown
    print("Shutting down application...")
    await close_db()


app = FastAPI(lifespan=lifespan) 

app.add_middleware(
    CORSMiddleware,
    # only origin can make request to backend 
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True, 
    #all HTTP methods allowed
    allow_methods = ["*"],
    # any headers allowed 
    allow_headers = ["*"],
)

#registers router, prefix - all routes defined in routes_upload module live in path /x, tags - tags route under "x" in docs
app.include_router(routes_upload.router, prefix="/upload", tags=["Upload"])
app.include_router(routes_analysis.router, prefix="/analysis", tags=["Analysis"])