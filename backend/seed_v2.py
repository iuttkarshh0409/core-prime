import sqlite3
from datetime import date, timedelta
import random
from pathlib import Path

# Connect to the database
DB_PATH = Path(__file__).resolve().parent.parent / "habit-tracker" / "db" / "habits.db"

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print(f"🌱 Seeding database at {DB_PATH}")

    # 1. CLEAR OLD DATA (Optional, but helps for a clean demo)
    cursor.execute("DELETE FROM logs")
    cursor.execute("DELETE FROM reflection_notes")
    cursor.execute("DELETE FROM habits")
    conn.commit()

    # 2. CREATE HABITS
    habits = [
        ("Deep Work", "daily"),
        ("Morning Run", "daily"),
        ("Hydration", "daily"),
        ("Social Media Detox", "daily")
    ]
    
    habit_ids = []
    for name, freq in habits:
        cursor.execute("INSERT INTO habits (name, frequency, created_at, is_active) VALUES (?, ?, ?, 1)", 
                       (name, freq, (date.today() - timedelta(days=95)).isoformat()))
        habit_ids.append(cursor.lastrowid)

    # 3. GENERATE 90 DAYS OF LOGS
    start_date = date.today() - timedelta(days=90)
    
    reflection_options = [
        "Felt tired today", "Travelled to office", "Bad sleep", 
        "Focused and productive", "Weekend trip", "Busy with exam",
        "High energy morning", "Late night work"
    ]

    for habit_id in habit_ids:
        # Give each habit a different consistency flavor
        # Habit 1: Strong (80%), Habit 2: Weekend bias, Habit 3: Inconsistent (40%)
        
        current_date = start_date
        while current_date <= date.today():
            is_weekend = current_date.weekday() >= 5
            
            # Simple probabilistic completion
            if habit_id == 1: # Deep Work (Weekday bias)
                prob = 0.85 if not is_weekend else 0.4
            elif habit_id == 2: # Morning Run (Strong start, then dips)
                prob = 0.7
            elif habit_id == 3: # Hydration (High consistency)
                prob = 0.9
            else: # Detox (Low consistency)
                prob = 0.4
            
            status = 1 if random.random() < prob else 0
            
            # Log the entry
            cursor.execute("INSERT INTO logs (habit_id, date, status) VALUES (?, ?, ?)",
                           (habit_id, current_date.isoformat(), status))
            
            # Occasionally add a reflection note
            if random.random() < 0.15:
                note = random.choice(reflection_options)
                cursor.execute("INSERT OR REPLACE INTO reflection_notes (habit_id, date, note) VALUES (?, ?, ?)",
                               (habit_id, current_date.isoformat(), note))
            
            current_date += timedelta(days=1)

    conn.commit()
    conn.close()
    print("✅ Seeding complete. 4 habits and 360+ logs generated.")

if __name__ == "__main__":
    seed_database()
