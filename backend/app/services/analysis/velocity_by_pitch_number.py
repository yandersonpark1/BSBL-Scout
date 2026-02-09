# backend/app/services/analysis/velocity_by_pitch_number.py
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Upload, Pitch


async def analyze_velocity_by_pitch_number(file_id: str, db: AsyncSession):
    """
    Get velocity data organized by pitch type and pitch number for line chart.

    Args:
        file_id: Upload ID as string
        db: SQLAlchemy async session

    Returns:
        dict with filename and velocity_data organized by pitch type
    """
    try:
        upload_id = int(file_id)
    except ValueError:
        return {"error": "Invalid file ID"}

    # Query upload
    stmt = select(Upload).where(Upload.id == upload_id)
    result = await db.execute(stmt)
    upload = result.scalar_one_or_none()

    if not upload:
        return {"error": "File not found"}

    # Query pitches for this upload, ordered by pitch number
    stmt = (
        select(Pitch)
        .where(Pitch.upload_id == upload_id)
        .where(Pitch.pitch_type.isnot(None))  # Filter out null pitch types
        .where(Pitch.velocity.isnot(None))    # Filter out null velocities
        .order_by(Pitch.pitch_number)
    )
    result = await db.execute(stmt)
    pitches = result.scalars().all()

    if not pitches:
        return {"error": "No pitch data found"}

    # Convert to pandas DataFrame
    pitch_data = [
        {
            "pitch_number": p.pitch_number,
            "pitch_type": p.pitch_type,
            "velocity": p.velocity
        }
        for p in pitches
    ]
    df = pd.DataFrame(pitch_data)

    # Convert velocity to numeric
    df['velocity'] = pd.to_numeric(df['velocity'], errors='coerce')
    df['pitch_number'] = pd.to_numeric(df['pitch_number'], errors='coerce')

    # Remove any rows with NaN values
    df = df.dropna()

    # Group by pitch type to create separate series for the line chart
    pitch_types = df['pitch_type'].unique()
    
    series_data = []
    for pitch_type in pitch_types:
        type_df = df[df['pitch_type'] == pitch_type].sort_values('pitch_number')
        series_data.append({
            "pitch_type": pitch_type,
            "data": type_df[['pitch_number', 'velocity']].to_dict(orient='records')
        })

    return {
        "filename": upload.filename,
        "series": series_data
    }
