"""
The single analysis endpoint.

    POST /analyze   multipart CSV  ->  full PitchingReport (JSON)
    GET  /analyze/schema           ->  the schema an upload must satisfy

No database, no persistence: a file comes in, is validated + analysed entirely
in memory, and the whole report goes back in one response.
"""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.csv_schema import (
    CANONICAL_COLUMNS,
    PLAYER_ID_PREFIX,
    PLAYER_NAME_PREFIX,
    REQUIRED_COLUMNS,
    CsvValidationError,
    parse_and_validate,
)
from app.core.retry import retry_async
from app.schemas.report import PitchingReport, SchemaInfo
from app.services.report import build_report

router = APIRouter()


@router.get("/schema", response_model=SchemaInfo)
async def get_schema() -> SchemaInfo:
    """Advertise the schema a CSV must satisfy — useful for tooling and docs."""
    return SchemaInfo(
        required_columns=list(REQUIRED_COLUMNS),
        canonical_columns=list(CANONICAL_COLUMNS),
        player_id_prefix=PLAYER_ID_PREFIX,
        player_name_prefix=PLAYER_NAME_PREFIX,
        max_upload_bytes=settings.MAX_UPLOAD_BYTES,
    )


@router.post("", response_model=PitchingReport)
async def analyze(file: UploadFile = File(...)) -> PitchingReport:
    """
    Validate a Rapsodo pitching CSV and return the complete dashboard report.

    Async handling:
        * the request body is read with ``await`` (non-blocking I/O);
        * the CPU-bound parse + pandas analysis runs in a threadpool so the
          event loop keeps serving other requests;
        * the pipeline is wrapped in an exponential-backoff retry that fails
          fast on validation errors but rides out transient failures.
    """
    filename = file.filename or "upload.csv"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only .csv files are accepted.",
        )

    # Read the upload in bounded chunks so an oversized file is rejected before
    # it is fully buffered in memory — the size guard must precede any analysis.
    max_bytes = settings.MAX_UPLOAD_BYTES
    buf = bytearray()
    while chunk := await file.read(1024 * 1024):  # 1 MB at a time
        buf.extend(chunk)
        if len(buf) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max allowed is {max_bytes // (1024 * 1024)} MB.",
            )
    raw = bytes(buf)

    async def pipeline() -> dict:
        # parse_and_validate is fast but still CPU work; build_report is the
        # heavy pandas step. Run both off the event loop.
        parsed = await run_in_threadpool(parse_and_validate, raw)
        return await run_in_threadpool(build_report, parsed, filename)

    try:
        report = await retry_async(
            pipeline,
            attempts=settings.RETRY_ATTEMPTS,
            base_delay=settings.RETRY_BASE_DELAY,
            max_delay=settings.RETRY_MAX_DELAY,
            do_not_retry=(CsvValidationError,),  # deterministic → fail fast
        )
    except CsvValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": exc.message, **exc.details},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyse the file after multiple attempts.",
        )

    return PitchingReport(**report)
