# Entry point for FastAPI application
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.database.db_connect import collection
from bson import ObjectId
import io, csv

app = FastAPI()

# Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")

    file_contents = await file.read()
    decoded = file_contents.decode("utf-8")

    reader = csv.DictReader(io.StringIO(decoded))
    rows = [row for row in reader]

    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    doc = {"filename": file.filename, "pitches": rows}
    result = collection.insert_one(doc)

    return {
        "message": "File uploaded successfully",
        "inserted_id": str(result.inserted_id),
        "rows_inserted": len(rows)
    }


@app.get("/insights/is_strike_by_id")
async def get_is_strike_by_id(file_id: str = Query(...)):
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file_id")

    doc = collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    pitches = doc.get("pitches", [])
    is_strike_values = [p.get("Is Strike", "N") for p in pitches]

    return {"file_id": file_id, "is_strike": is_strike_values}


@app.get("/insights/trajectory_by_id")
async def get_trajectory_by_id(file_id: str = Query(...)):
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid file_id")

    doc = collection.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")

    pitches = doc.get("pitches", [])
    trajectory_data = []

    for p in pitches:
        vb_raw = p.get("VB (trajectory)", "0")
        hb_raw = p.get("HB (trajectory)", "0")
        try:
            vb = float(vb_raw.replace("-", "0"))
            hb = float(hb_raw.replace("-", "0"))
            trajectory_data.append({
                "vb": vb,
                "hb": hb,
                "pitch_type": p.get("Pitch Type", "")
            })
        except ValueError:
            continue

    return {"file_id": file_id, "trajectory": trajectory_data}
