import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Upload, Pitch


async def analyze_velocity(file_id: str, db: AsyncSession):
    """
    Calculate average velocity by pitch type for a given upload.

    Args:
        file_id: Upload ID as string
        db: SQLAlchemy async session

    Returns:
        dict with filename and average_velocities list
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

    # Query pitches for this upload
    stmt = select(Pitch).where(Pitch.upload_id == upload_id)
    result = await db.execute(stmt)
    pitches = result.scalars().all()

    if not pitches:
        return {"error": "No pitch data found"}

    # Convert to pandas DataFrame (keep existing analysis logic)
    pitch_data = [
        {
            "Pitch Type": p.pitch_type,
            "Velocity": p.velocity
        }
        for p in pitches
    ]
    df = pd.DataFrame(pitch_data)

    if 'Velocity' not in df.columns or 'Pitch Type' not in df.columns:
        return {"error": "Required columns are missing in the data"}

    # Convert Velocity to numeric, if not NaN
    df['Velocity'] = pd.to_numeric(df['Velocity'], errors='coerce')

    # Group by pitch type and calculate mean
    grouped = df.groupby('Pitch Type')['Velocity'].mean().reset_index()

    # Convert to list of dicts
    results = grouped.to_dict(orient='records')

    return {
        "filename": upload.filename,
        "average_velocities": results
    }
