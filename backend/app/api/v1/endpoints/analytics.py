from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.db.session import get_db
from app.schemas.habit import GlobalStats
from app.services.analytics_service import get_global_stats
from app.services.insight_service import (
    generate_global_trend_insight,
    generate_miss_hotspot_insight,
    fetch_daily_completion_rate,
    fetch_detailed_conclusion
)
import aiosqlite

router = APIRouter()

@router.get("/global", response_model=GlobalStats)
async def fetch_overall_stats(db: aiosqlite.Connection = Depends(get_db)):
    stats = await get_global_stats(db)
    if not stats:
        raise HTTPException(status_code=404, detail="Not enough data yet")
    return stats

@router.get("/insights", response_model=List[str])
async def fetch_explainable_insights(db: aiosqlite.Connection = Depends(get_db)):
    insights = []
    
    trend = await generate_global_trend_insight(db)
    if trend:
        insights.append(trend)
        
    hotspot = await generate_miss_hotspot_insight(db)
    if hotspot:
        insights.append(hotspot)
        
    return insights

@router.get("/conclusions", response_model=List[str])
async def fetch_behavioral_conclusions(db: aiosqlite.Connection = Depends(get_db)):
    """
    Detailed behavioral conclusions for the 'Insight Engine v2' frontend section.
    """
    return await fetch_detailed_conclusion(db)

from fastapi.responses import StreamingResponse
from app.services.export_service import generate_csv_response
import io

@router.get("/trends", response_model=List[dict])
async def fetch_completion_trends(days: int = 30, db: aiosqlite.Connection = Depends(get_db)):
    """
    Fetch raw daily completion data for frontend charts.
    """
    return await fetch_daily_completion_rate(db, days)

@router.get("/export/overall")
async def export_overall_stats(db: aiosqlite.Connection = Depends(get_db)):
    """
    Export all habit logs to CSV.
    """
    async with db.execute("""
        SELECT h.name as habit, l.date, l.status
        FROM logs l
        JOIN habits h ON l.habit_id = h.id
        ORDER BY l.date DESC
    """) as cursor:
        rows = await cursor.fetchall()
        
    data = [dict(row) for row in rows]
    csv_content = generate_csv_response(data, ["habit", "date", "status"])
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=overall_stats.csv"}
    )

@router.get("/export/{habit_id}")
async def export_habit_stats(habit_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """
    Export specific habit logs to CSV.
    """
    async with db.execute("""
        SELECT date, status
        FROM logs
        WHERE habit_id = ?
        ORDER BY date DESC
    """, (habit_id,)) as cursor:
        rows = await cursor.fetchall()
        
    data = [dict(row) for row in rows]
    csv_content = generate_csv_response(data, ["date", "status"])
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=habit_{habit_id}_stats.csv"}
    )
