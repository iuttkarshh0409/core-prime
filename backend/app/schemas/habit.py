from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# --- HABITS ---

class HabitBase(BaseModel):
    name: str

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    is_active: bool
    created_at: datetime
    streak: int = 0
    consistency_30d: float = 0.0
    is_checked_today: bool = False

    class Config:
        from_attributes = True

# --- LOGS ---

class LogCreate(BaseModel):
    habit_id: int
    status: int # 1 = completed, 0 = missed
    date: Optional[str] = None # defaults to today in service

class LogResponse(BaseModel):
    status: str
    habit_id: int
    date: str

# --- GLOBAL STATS ---

class GlobalStats(BaseModel):
    total_habits: int
    overall_consistency: float
    most_consistent: str
    most_consistent_value: float
    longest_streak: str
    longest_streak_value: int
