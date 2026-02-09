"""SQLAlchemy ORM models for Oberlin Pitching Staff database"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from typing import List
from datetime import datetime


class Base(DeclarativeBase):
    """Base class for all ORM models"""
    pass


class Upload(Base):
    """Upload model representing a CSV file upload"""
    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )

    # Relationship: one upload -> many pitches
    pitches: Mapped[List["Pitch"]] = relationship(
        "Pitch",
        back_populates="upload",
        cascade="all, delete-orphan"  # Delete pitches when upload deleted
    )


class Pitch(Base):
    """Pitch model representing individual pitch data from CSV"""
    __tablename__ = "pitches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    upload_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("uploads.id", ondelete="CASCADE"),
        nullable=False,
        index=True  # Index for faster JOINs
    )
    pitch_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    pitch_type: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    velocity: Mapped[float | None] = mapped_column(Float, nullable=True)
    vb_trajectory: Mapped[float | None] = mapped_column(Float, nullable=True)
    hb_trajectory: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )

    # Relationship: many pitches -> one upload
    upload: Mapped["Upload"] = relationship("Upload", back_populates="pitches")
