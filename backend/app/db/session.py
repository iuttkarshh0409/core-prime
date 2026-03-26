import os
from dotenv import load_dotenv
import aiosqlite
import libsql_client
from contextlib import asynccontextmanager

load_dotenv()

TURSO_URL = os.getenv("TURSO_URL", "https://habits-db-iuttkarshh0409.aws-ap-south-1.turso.io")
TURSO_TOKEN = os.getenv("TURSO_TOKEN", "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ1NTMxNTIsImlkIjoiMDE5ZDJiOWMtMTAwMS03YjU1LWFmOTgtM2UzOWUwMjRiMDc4IiwicmlkIjoiMWM5MWU4NzMtYTg5OC00MjIxLWI0YTMtMWU0ZTFkYTlhMDBiIn0.v1MkNnEOoWFhrNp0DmkgxQtN_noA3SZ8MFxdDuvWQMNxLq1WZpocGSk1Yd6U7LkqfLThHqcm8c3dOcpI9uaSCQ")

class CompactRow(dict):
    """A dict that also supports index-style access."""
    def __init__(self, columns, values):
        self._values = values
        super().__init__(zip(columns, values))

    def __getitem__(self, key):
        if isinstance(key, int):
            return self._values[key]
        return super().__getitem__(key)

class TursoCompatibilityWrapper:
    def __init__(self, client):
        self.client = client
    
    @asynccontextmanager
    async def execute(self, sql, params=None):
        # Handle the case where params is a single value, not a list/tuple
        if params is not None and not isinstance(params, (list, tuple)):
            params = (params,)
            
        rs = await self.client.execute(sql, params or ())
        
        class MockCursor:
            def __init__(self, rs):
                self.rs = rs
                # Use a safer way to get the last ID
                self.lastrowid = getattr(rs, 'last_insert_rowid', None)
            async def fetchall(self):
                return [CompactRow(self.rs.columns, row) for row in self.rs.rows]
            async def fetchone(self):
                if not self.rs.rows: return None
                return CompactRow(self.rs.columns, self.rs.rows[0])
        
        yield MockCursor(rs)

    async def commit(self):
        # Libsql is auto-commit unless in a transaction block
        pass

    async def close(self):
        await self.client.close()

async def get_db():
    # Use the create_client correctly. 
    # For Vercel/Serverless, a fresh client per request is safest.
    client = libsql_client.create_client(url=TURSO_URL, auth_token=TURSO_TOKEN)
    wrapper = TursoCompatibilityWrapper(client)
    try:
        yield wrapper
    finally:
        await wrapper.close()
