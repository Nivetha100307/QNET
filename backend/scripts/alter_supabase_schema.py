import asyncio
import os
import sys
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("[ERROR] DATABASE_URL environment variable is missing.")
    sys.exit(1)

# Ensure asyncpg driver dialect
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

async def main():
    print(f"[INFO] Connecting to Supabase PostgreSQL to alter column length...")
    engine = create_async_engine(DATABASE_URL, echo=True, connect_args={"ssl": "prefer"})
    
    async with engine.begin() as conn:
        print("[INFO] Executing ALTER TABLE quantum_security_reports ALTER COLUMN security_status TYPE VARCHAR(50)...")
        await conn.execute(text("ALTER TABLE quantum_security_reports ALTER COLUMN security_status TYPE VARCHAR(50);"))
        print("[SUCCESS] Column security_status successfully expanded to VARCHAR(50).")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
