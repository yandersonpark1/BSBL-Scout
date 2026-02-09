from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.analysis import analyze_velocity, analyze_pitch_mix, analyze_fastball_velocity
from app.services.analysis.velocity_by_pitch_number import analyze_velocity_by_pitch_number
from app.schemas.analysis_schema import VelocityAnalysis, PitchMixAnalysis, FastballVelocity, VelocityByPitchNumber
from app.database.db_connect import get_db

router = APIRouter()

@router.get("/velocity/{file_id}", response_model=VelocityAnalysis)
async def velocity_graph(file_id: str, db: AsyncSession = Depends(get_db)):
    return await analyze_velocity(file_id, db)

@router.get("/pitch_mix/{file_id}", response_model=PitchMixAnalysis)
async def pitch_mix_graph(file_id: str, db: AsyncSession = Depends(get_db)):
    return await analyze_pitch_mix(file_id, db)

@router.get("/fastball_velocity/{file_id}", response_model=FastballVelocity)
async def fastball_velocity_graph(file_id: str, db: AsyncSession = Depends(get_db)):
    return await analyze_fastball_velocity(file_id, db)

@router.get("/velocity_by_pitch_number/{file_id}", response_model=VelocityByPitchNumber)
async def velocity_by_pitch_number_graph(file_id: str, db: AsyncSession = Depends(get_db)):
    return await analyze_velocity_by_pitch_number(file_id, db)
