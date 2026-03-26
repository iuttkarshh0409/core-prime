import sqlite3
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

# DB CONFIG
LOCAL_DB = Path(__file__).resolve().parent.parent / "habit-tracker" / "db" / "habits.db"
TURSO_URL = "libsql://habits-db-iuttkarshh0409.aws-ap-south-1.turso.io"
TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQ1NTMxNTIsImlkIjoiMDE5ZDJiOWMtMTAwMS03YjU1LWFmOTgtM2UzOWUwMjRiMDc4IiwicmlkIjoiMWM5MWU4NzMtYTg5OC00MjIxLWI0YTMtMWU0ZTFkYTlhMDBiIn0.v1MkNnEOoWFhrNp0DmkgxQtN_noA3SZ8MFxdDuvWQMNxLq1WZpocGSk1Yd6U7LkqfLThHqcm8c3dOcpI9uaSCQ"

# We'll use the libsql python client
from libsql_client import create_client_sync

def migrate():
    print(f"🔄 Migrating {LOCAL_DB} to Turso cloud...")
    
    if not LOCAL_DB.exists():
        print("❌ Local database not found!")
        return

    # Connect to local
    conn = sqlite3.connect(LOCAL_DB)
    cursor = conn.cursor()

    # Connect to Turso
    turso = create_client_sync(url=TURSO_URL, auth_token=TURSO_TOKEN)

    # 1. CREATE SCHEMA ON TURSO
    schema = [
        """CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            frequency TEXT DEFAULT 'daily',
            created_at DATE,
            is_active INTEGER DEFAULT 1
        )""",
        """CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            date DATE,
            status INTEGER,
            FOREIGN KEY (habit_id) REFERENCES habits(id),
            UNIQUE(habit_id, date)
        )""",
        """CREATE TABLE IF NOT EXISTS reflection_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            date DATE,
            note TEXT,
            FOREIGN KEY (habit_id) REFERENCES habits(id),
            UNIQUE(habit_id, date)
        )"""
    ]
    
    for stmt in schema:
        turso.execute(stmt)
    
    # 2. CLEAR DESTINATION (Optional, but clean)
    turso.execute("DELETE FROM logs")
    turso.execute("DELETE FROM reflection_notes")
    turso.execute("DELETE FROM habits")
    print("🧹 Cleared existing cloud records.")

    # 3. MIGRATE HABITS
    cursor.execute("SELECT id, name, frequency, created_at, is_active FROM habits")
    habits = cursor.fetchall()
    for h in habits:
        turso.execute("INSERT INTO habits (id, name, frequency, created_at, is_active) VALUES (?, ?, ?, ?, ?)", h)
    
    # 4. MIGRATE LOGS
    cursor.execute("SELECT habit_id, date, status FROM logs")
    logs = cursor.fetchall()
    for l in logs:
        turso.execute("INSERT INTO logs (habit_id, date, status) VALUES (?, ?, ?)", l)
        
    # 5. MIGRATE REFLECTIONS
    cursor.execute("SELECT habit_id, date, note FROM reflection_notes")
    refs = cursor.fetchall()
    for r in refs:
        turso.execute("INSERT INTO reflection_notes (habit_id, date, note) VALUES (?, ?, ?)", r)

    print(f"✅ Migration Successful! {len(habits)} habits and {len(logs)} logs pushed to the edge.")
    conn.close()

if __name__ == "__main__":
    migrate()
