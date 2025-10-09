from fastapi import APIRouter

from app.services.analysis import analyze_velocity, analyze_pitch_mix, analyze_fastball_velocity
from app.schemas.analysis_schema import VelocityAnalysis, PitchMixAnalysis, FastballVelocity

router = APIRouter()

@router.get("/velocity/{file_id}", response_model=VelocityAnalysis)
async def velocity_graph(file_id: str):
    return analyze_velocity(file_id)

@router.get("/pitch_mix/{file_id}", response_model=PitchMixAnalysis)
async def pitch_mix_graph(file_id: str):
    return analyze_pitch_mix(file_id)

@router.get("/fastball_velocity/{file_id}", response_model=FastballVelocity)
async def fastball_velocity_graph(file_id: str): 
    return analyze_fastball_velocity(file_id)