import aiosqlite
from datetime import date, timedelta
from typing import List, Optional, Dict

async def generate_global_trend_insight(db: aiosqlite.Connection) -> Optional[str]:
    """
    Check if overall completion rate is improving (last 7 days vs previous 23).
    """
    today = date.today()
    last_7_days = (today - timedelta(days=7)).isoformat()
    last_30_days = (today - timedelta(days=30)).isoformat()

    async with db.execute("""
        SELECT 
            AVG(CASE WHEN date >= ? THEN status ELSE NULL END) as recent_avg,
            AVG(CASE WHEN date < ? AND date >= ? THEN status ELSE NULL END) as prev_avg
        FROM logs
        WHERE date >= ?
    """, (last_7_days, last_7_days, last_30_days, last_30_days)) as cursor:
        row = await cursor.fetchone()
        if not row or row[0] is None or row[1] is None:
            return None
        
        recent, prev = row[0], row[1]
        diff = recent - prev
        if diff > 0.1:
            return f"📈 Performance uptrend detected: Your completion rate improved by {round(diff*100)}% this week."
        elif diff < -0.1:
            return f"⚠️ Warning: Operational drift detected. Completion rate decreased by {round(abs(diff)*100)}% recently."
        return "⚖️ Consistency is stable across recent cycles."

async def generate_miss_hotspot_insight(db: aiosqlite.Connection) -> Optional[str]:
    """
    Identify the weakest day of the week.
    """
    # 0=Monday, 6=Sunday in STRFTIME(%w), wait, sqlite %w is 0-6 (Sunday=0)
    # Actually, we can use CASE or just map it in python
    async with db.execute("""
        SELECT strftime('%w', date) as dow, AVG(status) as rate
        FROM logs
        WHERE date >= date('now', '-30 days')
        GROUP BY dow
        ORDER BY rate ASC
        LIMIT 1
    """) as cursor:
        row = await cursor.fetchone()
        if not row: return None
        
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        dow_idx = int(row[0])
        weak_day = days[dow_idx]
        rate = round(row[1] * 100)
        
        if rate < 60:
            return f"🧘 Weekly Pattern: {weak_day}s are your bottleneck (only {rate}% completion). Plan accordingly."
        return None

async def fetch_daily_completion_rate(db: aiosqlite.Connection, days: int = 30) -> List[dict]:
    """
    Raw daily completion rates for charts.
    """
    start_date = (date.today() - timedelta(days=days)).isoformat()
    async with db.execute("""
        SELECT date, SUM(status) as completed, COUNT(*) as total
        FROM logs
        WHERE date >= ?
        GROUP BY date
        ORDER BY date ASC
    """, (start_date,)) as cursor:
        rows = await cursor.fetchall()
        
    return [dict(row) for row in rows]

async def fetch_detailed_conclusion(db: aiosqlite.Connection) -> List[str]:
    """
    Detailed behavioral conclusions for the 'Insight Engine v2' tab.
    """
    conclusions = []
    
    # 1. High Momentum Identification
    async with db.execute("""
        SELECT h.name, COUNT(l.id) as streaks
        FROM logs l
        JOIN habits h ON l.habit_id = h.id
        WHERE l.date >= date('now', '-14 days') AND l.status = 1
        GROUP BY h.id
        ORDER BY streaks DESC
        LIMIT 1
    """) as cursor:
        row = await cursor.fetchone()
        if row:
            conclusions.append(f"🔥 '{row[0]}' is your primary momentum driver with {row[1]} completions in the last 14 days.")

    # 2. Reflection Correlation (Placeholder for text analysis)
    async with db.execute("""
        SELECT COUNT(*) 
        FROM reflection_notes 
        WHERE date >= date('now', '-30 days')
    """) as cursor:
        row = await cursor.fetchone()
        if row and row[0] > 5:
            conclusions.append(f"🧠 High Self-Awareness: You have logged {row[0]} reflection notes this month. Reviewing these often correlates with longer streaks.")

    # 3. Weekend Stability
    async with db.execute("""
        SELECT 
            AVG(CASE WHEN strftime('%w', date) IN ('0','6') THEN status ELSE NULL END) as weekend_avg,
            AVG(CASE WHEN strftime('%w', date) NOT IN ('0','6') THEN status ELSE NULL END) as weekday_avg
        FROM logs
        WHERE date >= date('now', '-30 days')
    """) as cursor:
        row = await cursor.fetchone()
        if row and row[0] is not None and row[1] is not None:
            if row[0] > row[1]:
                conclusions.append("🌟 Biometric Signal: Your performance peaks during weekends. Try applying your weekend routine triggers to workdays.")
            else:
                conclusions.append("💻 Rhythm Check: Performance decreases on weekends. Consider simplifying your weekend protocols.")

    return conclusions
