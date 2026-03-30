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

    # Ensure we are dealing with a sorted list of unique dates (descending)
    unique_dates = sorted(list(set(log_dates)), reverse=True)
    
    current_date = datetime.today().date()
    yesterday = current_date - timedelta(days=1)
    
    streak = 0
    
    # 1. Parse dates if they are strings
    parsed_dates = []
    for d in unique_dates:
        if isinstance(d, str):
            parsed_dates.append(datetime.strptime(d, "%Y-%m-%d").date())
        else:
            parsed_dates.append(d)

    # 2. Check if the most recent log is today or yesterday
    # If not, the streak is broken (0).
    if not parsed_dates or (parsed_dates[0] != current_date and parsed_dates[0] != yesterday):
        return 0

    # 3. Iterate through history
    # Start looking from the most recent logged date
    expected_date = parsed_dates[0]
    
    for d in parsed_dates:
        print(f"DEBUG: Checking date {d}, expected {expected_date}")
        if d == expected_date:
            streak += 1
            expected_date -= timedelta(days=1)
        else:
            # Gap found, streak ends
            print(f"DEBUG: Gap found! {d} != {expected_date}")
            break

    print(f"DEBUG: Final streak calculated: {streak}")
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
