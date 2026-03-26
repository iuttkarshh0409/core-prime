from typing import List, Optional, Dict
import aiosqlite
from datetime import date, timedelta
from app.services.streak_service import get_current_streak

async def get_consistency_percentage(db: aiosqlite.Connection, habit_id: int, days: int = 30) -> float:
    start_date = date.today() - timedelta(days=days - 1)
    
    async with db.execute("""
        SELECT COUNT(*)
        FROM logs
        WHERE habit_id = ? AND status = 1 AND date >= ?
    """, (habit_id, start_date.isoformat())) as cursor:
        row = await cursor.fetchone()
        completed_days = row[0] if row else 0
        
    return round((completed_days / days) * 100, 1)

async def get_global_stats(db: aiosqlite.Connection, days: int = 30) -> Optional[Dict]:
    async with db.execute("SELECT id, name FROM habits WHERE is_active = 1") as cursor:
        habits = await cursor.fetchall()
    
    if not habits:
        return None

    # Overall consistency across all habits
    start_date = date.today() - timedelta(days=days - 1)
    async with db.execute("""
        SELECT SUM(status), COUNT(*)
        FROM logs
        WHERE date >= ?
    """, (start_date.isoformat(),)) as cursor:
        row = await cursor.fetchone()
        completed = row[0] or 0
        total = row[1] or 1
        overall_consistency = round((completed / total) * 100, 1)

    # Per-habit breakdown
    consistency_map = {}
    streak_map = {}

    for habit in habits:
        name = habit["name"]
        h_id = habit["id"]
        consistency_map[name] = await get_consistency_percentage(db, h_id, days)
        streak_map[name] = await get_current_streak(db, h_id)

    if not consistency_map:
        return None

    most_consistent = max(consistency_map, key=consistency_map.get)
    longest_streak = max(streak_map, key=streak_map.get)

    return {
        "total_habits": len(habits),
        "overall_consistency": overall_consistency,
        "most_consistent": most_consistent,
        "most_consistent_value": consistency_map[most_consistent],
        "longest_streak": longest_streak,
        "longest_streak_value": streak_map[longest_streak]
    }
