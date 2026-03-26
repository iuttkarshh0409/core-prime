import httpx
from datetime import datetime
import logging

# In production, this URL should be moved to a .env file
SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpGSx9AMYIkf3t_41jA_YPHXVT7kMMjQH9KB9IMApVfdGXdSYjOXRKtRbUAxSMeDG2/exec"

async def send_row_to_sheet_async(habit_id: int, habit_name: str, status: int, date: str):
    """
    Background task to sync logs with Google Sheets.
    """
    payload = {
        "export_timestamp": datetime.utcnow().isoformat(),
        "user_id": "production_v2",
        "habit_id": habit_id,
        "habit_name": habit_name,
        "date": date,
        "status": status,
        "is_active": True,
        "consistency_7d": 0.0, # (to be implemented if needed in sheets)
        "consistency_30d": 0.0, 
        "streak_on_date": 0,
        "has_reflection": False,
        "schema_version": "2.0"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SCRIPT_URL, json=payload, timeout=10)
            if response.status_code != 200:
                logging.error(f"Failed to sync with Google Sheets: {response.status_code}")
    except Exception as e:
        logging.error(f"Background task error during sheet sync: {str(e)}")
