from pydantic import BaseModel, Field
from typing import Optional 

#Velocity Analysis returns {filename: str, average_velocities: [{pitch_type: str, velocity: float}, {..}]}; so needs pydantics
class PitchVelocity(BaseModel):
    pitch_type: str
    velocity: float

class VelocityAnalysis(BaseModel): 
    filename: str 
    average_velocities: list[PitchVelocity]

class PitchMix(BaseModel): 
    pitch_type: str
    vb: float = Field(..., alias="HB (trajectory)")
    hb: float = Field(..., alias="VB (trajectory)")
    
class PitchMixAnalysis(BaseModel): 
    filename: str
    pitch_mix: list[PitchMix]

class Fastballs(BaseModel): 
    No: int 
    pitchType: str = Field(..., alias="Pitch Type")
    Velocity: float
    
class FastballVelocity(BaseModel): 
    filename: str 
    fastballs: list[Fastballs]
    count: int 
    

    
    