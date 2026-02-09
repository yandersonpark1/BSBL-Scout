import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Upload, Pitch


async def analyze_fastball_velocity(file_id: str, db: AsyncSession):
    """
    Filter and return all fastball pitches with velocity data.

    Args:
        file_id: Upload ID as string
        db: SQLAlchemy async session

    Returns:
        dict with filename, fastballs list, and count
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

    # Query pitches
    stmt = select(Pitch).where(Pitch.upload_id == upload_id)
    result = await db.execute(stmt)
    pitches = result.scalars().all()

    # Convert to pandas DataFrame
    pitch_data = [
        {
            "No": p.pitch_number,
            "Pitch Type": p.pitch_type,
            "Velocity": p.velocity
        }
        for p in pitches
    ]
    df = pd.DataFrame(pitch_data)

    if 'Velocity' not in df.columns or 'Pitch Type' not in df.columns:
        return {"error": "Required columns are missing in the data"}

    # Convert Velocity to numeric
    df['Velocity'] = pd.to_numeric(df['Velocity'], errors='coerce')

    # Filter for fastballs
    fastballs = df[df['Pitch Type'].str.lower().str.contains("fastball", na=False)]

    fastball_list = fastballs[['No', 'Pitch Type', 'Velocity']].to_dict(orient="records")

    return {
        "filename": upload.filename,
        "fastballs": fastball_list,
        "count": len(fastball_list)
    }
