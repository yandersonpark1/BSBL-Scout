import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Upload, Pitch


async def analyze_pitch_mix(file_id: str, db: AsyncSession):
    """
    Get pitch trajectory data (VB, HB) for all pitches in an upload.

    Args:
        file_id: Upload ID as string
        db: SQLAlchemy async session

    Returns:
        dict with filename and pitch_mix list
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
            "Pitch Type": p.pitch_type,
            "VB (trajectory)": p.vb_trajectory,
            "HB (trajectory)": p.hb_trajectory
        }
        for p in pitches
    ]
    df = pd.DataFrame(pitch_data)

    required_cols = ["Pitch Type", "VB (trajectory)", "HB (trajectory)"]
    for col in required_cols:
        if col not in df.columns:
            return {"error": f"CSV missing required column: {col}"}

    df['VB (trajectory)'] = pd.to_numeric(df['VB (trajectory)'], errors='coerce')
    df['HB (trajectory)'] = pd.to_numeric(df['HB (trajectory)'], errors='coerce')

    df = df.dropna(subset=["VB (trajectory)", 'HB (trajectory)', "Pitch Type"])

    # Rename for API schema compatibility
    df = df.rename(columns={"Pitch Type": "pitch_type"})

    results = df[["pitch_type", 'VB (trajectory)', 'HB (trajectory)']].to_dict(orient="records")

    return {
        "filename": upload.filename,
        "pitch_mix": results
    }
