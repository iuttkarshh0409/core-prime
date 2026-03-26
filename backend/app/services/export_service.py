import csv
import io
from typing import List, Dict

def generate_csv_response(data: List[Dict], fieldnames: List[str]) -> str:
    """
    Generate a CSV string from a list of dictionaries.
    """
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()
