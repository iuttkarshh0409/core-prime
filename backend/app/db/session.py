import os
from dotenv import load_dotenv
import aiosqlite
import libsql_client
from contextlib import asynccontextmanager

load_dotenv()

# FIX: Use https:// for reliable cloud connection on Vercel
TURSO_URL = os.getenv("TURSO_URL", "https://habits-db-iuttkarshh0409.aws-ap-south-1.turso.io")
TURSO_TOKEN = os.getenv("TURSO_TOKEN", "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ1NTMxNTIsImlkIjoiMDE5ZDJiOWMtMTAwMS03YjU1LWFmOTgtM2UzOWUwMjRiMDc4IiwicmlkIjoiMWM5MWU4NzMtYTg5OC00MjIxLWI0YTMtMWU0ZTFkYTlhMDBiIn0.v1MkNnEOoWFhrNp0DmkgxQtN_noA3SZ8MFxdDuvWQMNxLq1WZpocGSk1Yd6U7LkqfLThHqcm8c3dOcpI9uaSCQ")

class TursoCompatibilityWrapper:
    def __init__(self, client):
        self.client = client
    
    @asynccontextmanager
    async def execute(self, sql, params=None):
        rs = await self.client.execute(sql, params or ())
        # Mock cursor behavior
        class MockCursor:
            def __init__(self, rs):
                self.rs = rs
                self.lastrowid = None # Libsql returns this in another field if needed
            async def fetchall(self):
                # Convert results to dicts for row_factory like behavior
                return [dict(zip(self.rs.columns, row)) for row in self.rs.rows]
            async def fetchone(self):
                if not self.rs.rows: return None
                return dict(zip(self.rs.columns, self.rs.rows[0]))
        
        yield MockCursor(rs)

    async def commit(self):
        pass # Turso is auto-commit or handles it via transactions

    async def close(self):
        await self.client.close()

async def get_db():
    client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN)
    wrapper = TursoCompatibilityWrapper(client)
    try:
        yield wrapper
    finally:
        await wrapper.close()
