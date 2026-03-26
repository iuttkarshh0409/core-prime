from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.session import get_db
from app.schemas.habit import Habit, HabitCreate
from app.services.streak_service import get_current_streak
from datetime import date, timedelta
import aiosqlite

router = APIRouter()

async def calculate_consistency(db: aiosqlite.Connection, habit_id: int, days: int = 30) -> float:
    """
    Calculate consistency percentage over the last N days.
    """
    start_date = (date.today() - timedelta(days=days)).isoformat()
    async with db.execute("""
        SELECT COUNT(*) as completed,
               (SELECT COUNT(*) FROM logs WHERE habit_id = ? AND date >= ?) as total
        FROM logs
        WHERE habit_id = ? AND date >= ? AND status = 1
    """, (habit_id, start_date, habit_id, start_date)) as cursor:
        row = await cursor.fetchone()
        if not row or row[1] == 0:
            return 0.0
        return round((row[0] / row[1]) * 100, 1)

@router.get("/", response_model=List[Habit])
async def fetch_habits(db: aiosqlite.Connection = Depends(get_db)):
    """
    Fetch all active habits with their current streak and consistency.
    """
    today = date.today().isoformat()
    
    async with db.execute("""
        SELECT h.id, h.name, h.created_at, h.is_active,
               (SELECT COUNT(*) FROM logs l WHERE l.habit_id = h.id AND l.date = ?) as is_checked_today
        FROM habits h
        WHERE h.is_active = 1
        ORDER BY h.created_at DESC
    """, (today,)) as cursor:
        rows = await cursor.fetchall()

    habits = []
    for row in rows:
        h_dict = dict(row)
        h_id = h_dict["id"]
        h_dict["streak"] = await get_current_streak(db, h_id)
        h_dict["consistency_30d"] = await calculate_consistency(db, h_id, 30)
        habits.append(h_dict)

    return habits

@router.get("/archived", response_model=List[Habit])
async def fetch_archived_habits(db: aiosqlite.Connection = Depends(get_db)):
    """
    Fetch all archived habits.
    """
    async with db.execute("""
        SELECT id, name, created_at, is_active
        FROM habits
        WHERE is_active = 0
        ORDER BY created_at DESC
    """) as cursor:
        rows = await cursor.fetchall()
        
    habits = []
    for row in rows:
        h_dict = dict(row)
        h_id = h_dict["id"]
        h_dict["streak"] = await get_current_streak(db, h_id)
        h_dict["consistency_30d"] = await calculate_consistency(db, h_id, 30)
        h_dict["is_checked_today"] = False
        habits.append(h_dict)
        
    return habits

@router.post("/", response_model=Habit)
async def create_habit(habit: HabitCreate, db: aiosqlite.Connection = Depends(get_db)):
    """
    Create a new habit.
    """
    try:
        async with db.execute("""
            INSERT INTO habits (name, frequency, created_at, is_active)
            VALUES (?, ?, DATE('now'), 1)
        """, (habit.name, "daily")) as cursor:
            habit_id = cursor.lastrowid
            await db.commit()
            
        return {
            "id": habit_id,
            "name": habit.name,
            "is_active": True,
            "created_at": date.today().isoformat(),
            "streak": 0,
            "consistency_30d": 0.0,
            "is_checked_today": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{habit_id}/archive")
async def archive_habit(habit_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """
    Archive a habit.
    """
    await db.execute("UPDATE habits SET is_active = 0 WHERE id = ?", (habit_id,))
    await db.commit()
    return {"status": "success", "message": f"Habit {habit_id} archived."}

@router.patch("/{habit_id}/unarchive")
async def unarchive_habit(habit_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """
    Restore an archived habit.
    """
    await db.execute("UPDATE habits SET is_active = 1 WHERE id = ?", (habit_id,))
    await db.commit()
    return {"status": "success", "message": f"Habit {habit_id} restored."}
