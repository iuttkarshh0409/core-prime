from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from app.db.session import get_db
from app.schemas.habit import LogCreate, LogResponse
from app.services.background_tasks import send_row_to_sheet_async
import aiosqlite
from datetime import date

router = APIRouter()

@router.post("/check-in", response_model=LogResponse)
async def check_in_today(
    log_data: LogCreate, 
    background_tasks: BackgroundTasks,
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Mark a habit as Completed (1) or Missed (0) and sync history to Google Sheets.
    """
    log_date = log_data.date or date.today().isoformat()
    
    try:
        query = """
            INSERT INTO logs (habit_id, date, status)
            VALUES (?, ?, ?)
            ON CONFLICT(habit_id, date) DO UPDATE SET status = excluded.status
        """
        async with db.execute(query, (log_data.habit_id, log_date, log_data.status)) as cursor:
            await db.commit()

        # FETCH HABIT NAME (for sheets payload)
        async with db.execute("SELECT name FROM habits WHERE id = ?", (log_data.habit_id,)) as cursor:
            habit_row = await cursor.fetchone()
            habit_name = habit_row["name"] if habit_row else "Unknown"

        # Tigger background task for Google Sheets
        background_tasks.add_task(
            send_row_to_sheet_async,
            log_data.habit_id,
            habit_name,
            log_data.status,
            log_date
        )

        return {
            "status": "success",
            "habit_id": log_data.habit_id,
            "date": log_date
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{habit_id}", response_model=List[dict])
async def get_logs_for_habit(habit_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """
    Get all history logs for a specific habit, including optional reflection notes.
    """
    async with db.execute("""
        SELECT l.date, l.status, r.note as reflection
        FROM logs l
        LEFT JOIN reflection_notes r ON l.habit_id = r.habit_id AND l.date = r.date
        WHERE l.habit_id = ?
        ORDER BY l.date DESC
    """, (habit_id,)) as cursor:
        rows = await cursor.fetchall()
        
    return [dict(row) for row in rows]
