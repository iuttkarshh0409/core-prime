from datetime import datetime, timedelta
from typing import List, Any
import aiosqlite

def calculate_streak(log_dates: List[Any]):
    """
    log_dates: list of dates where habit was completed
    returns: current streak count
    """
    if not log_dates:
        return 0

    log_dates = sorted(log_dates, reverse=True)
    streak = 0
    today = datetime.today().date()

    expected_date = today

    for d in log_dates:
        # Normalize types in case they're strings or date objects
        if isinstance(d, str):
            d = datetime.strptime(d, "%Y-%m-%d").date()

        if d == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        elif d < expected_date:
            break

    return streak

async def fetch_completed_dates(db: aiosqlite.Connection, habit_id: int):
    """
    Async version of the old db_utils.fetch_completed_dates
    """
    async with db.execute("""
        SELECT date
        FROM logs
        WHERE habit_id = ? AND status = 1
        ORDER BY date DESC
    """, (habit_id,)) as cursor:
        rows = await cursor.fetchall()

    return [row["date"] for row in rows]

async def get_current_streak(db: aiosqlite.Connection, habit_id: int):
    dates = await fetch_completed_dates(db, habit_id)
    return calculate_streak(dates)
