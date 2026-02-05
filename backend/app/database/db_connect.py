"""PostgreSQL database connection for Oberlin Pitching Staff"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get PostgreSQL connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

# Create async engine with connection pooling
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Max 10 connections in pool
    max_overflow=20,  # Allow 20 overflow connections
    pool_recycle=3600,  # Recycle connections after 1 hour
    future=True
)

# Session factory for creating new sessions
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autocommit=False,
    autoflush=False
)


async def get_db():
    """
    Dependency for FastAPI routes to get database session.

    Usage in routes:
        async def my_route(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables.
    Call this on application startup.
    """
    from app.database.models import Base
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")


async def close_db():
    """
    Close database connections.
    Call this on application shutdown.
    """
    await engine.dispose()
    print("Database connections closed.")
