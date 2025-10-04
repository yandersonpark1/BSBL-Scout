from fastapi import APIRouter

from app.services.analysis import analyze_velocity, analyze_pitch_mix
from app.schemas.analysis_schema import VelocityAnalysis, PitchMixAnalysis

router = APIRouter()

@router.get("/{file-id}/velocity", response_model=VelocityAnalysis)
async def velocity_graph(file_id: str):
    return analyze_velocity(file_id)

@router.get("/{file-id}/pitch-mix", response_model=PitchMixAnalysis)
async def pitch_mix_graph(file_id: str):
    return analyze_pitch_mix(file_id)