import io
import csv
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models import Upload, Pitch


async def handle_upload(file, db: AsyncSession):
    """
    Parse CSV file and insert into uploads + pitches tables.

    Args:
        file: FastAPI UploadFile object
        db: SQLAlchemy async session

    Returns:
        dict with message, inserted_id (as string), and rows_inserted
    """
    # Read and decode CSV
    file_contents = await file.read()
    decoded = file_contents.decode('utf-8')

    # Skip the first 3 lines (Player ID, Player Name, blank line)
    lines = decoded.splitlines()

    # Extract player metadata from first two lines (optional - you can store this later)
    # player_id_line = lines[0] if len(lines) > 0 else ""
    # player_name_line = lines[1] if len(lines) > 1 else ""

    # Join lines starting from line 4 (index 3) which has the actual headers
    csv_data = '\n'.join(lines[3:]) if len(lines) > 3 else ""

    reader = csv.DictReader(io.StringIO(csv_data))
    data = [row for row in reader]

    if not data:
        return {"message": "No data found in the CSV file."}

    try:
        # Create Upload record
        upload = Upload(filename=file.filename)
        db.add(upload)
        await db.flush()  # Get upload.id without committing

        # Create Pitch records
        pitch_objects = []
        for row in data:
            # Helper function to safely convert to number, handling "-" and empty strings
            def safe_int(value):
                if not value or value == "-":
                    return None
                try:
                    return int(value)
                except (ValueError, TypeError):
                    return None

            def safe_float(value):
                if not value or value == "-":
                    return None
                try:
                    return float(value)
                except (ValueError, TypeError):
                    return None

            def safe_string(value):
                if not value or value == "-":
                    return None
                return value

            pitch = Pitch(
                upload_id=upload.id,
                pitch_number=safe_int(row.get("No")),
                pitch_type=safe_string(row.get("Pitch Type")),
                velocity=safe_float(row.get("Velocity")),
                vb_trajectory=safe_float(row.get("VB (trajectory)")),
                hb_trajectory=safe_float(row.get("HB (trajectory)")),
            )
            pitch_objects.append(pitch)

        db.add_all(pitch_objects)
        await db.commit()
        await db.refresh(upload)  # Ensure upload.id is accessible

        return {
            "message": "File uploaded successfully",
            "inserted_id": str(upload.id),  # Convert to string for API compatibility
            "rows_inserted": len(data)
        }

    except Exception as e:
        await db.rollback()
        raise e
