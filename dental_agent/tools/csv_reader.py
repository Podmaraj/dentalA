"""CSV read operations — query tools for the dental appointment system."""

import pandas as pd
from langchain_core.tools import tool
from dental_agent.config.settings import CSV_PATH


def _load_csv() -> pd.DataFrame:
    """Load the CSV file into a DataFrame."""
    df = pd.read_csv(CSV_PATH)
    df["date_slot"] = pd.to_datetime(df["date_slot"])
    df["is_available"] = df["is_available"].astype(str).str.upper() == "TRUE"
    return df


@tool
def get_available_slots(
    specialization: str = "",
    doctor_name: str = "",
    date: str = "",
) -> str:
    """Get available appointment slots. Filter by specialization, doctor_name, or date (YYYY-MM-DD).
    All filters are optional — if none provided, returns all available slots."""
    df = _load_csv()
    available = df[df["is_available"] == True].copy()

    if specialization:
        available = available[available["specialization"].str.lower() == specialization.lower()]
    if doctor_name:
        available = available[available["doctor_name"].str.lower() == doctor_name.lower()]
    if date:
        available = available[available["date_slot"].dt.strftime("%Y-%m-%d") == date]

    if available.empty:
        return "No available slots found matching the criteria."

    # Limit to 20 results
    results = available.head(20)
    lines = []
    for _, row in results.iterrows():
        lines.append(
            f"- {row['date_slot'].strftime('%Y-%m-%d %H:%M')} | Dr. {row['doctor_name'].title()} | {row['specialization']}"
        )

    total = len(available)
    header = f"Found {total} available slot(s)"
    if total > 20:
        header += f" (showing first 20)"
    header += ":\n"
    return header + "\n".join(lines)


@tool
def get_patient_appointments(patient_id: str) -> str:
    """Look up all appointments for a given patient ID."""
    df = _load_csv()
    df["patient_to_attend"] = df["patient_to_attend"].astype(str).str.strip()
    patient_rows = df[df["patient_to_attend"] == str(patient_id)]

    if patient_rows.empty:
        return f"No appointments found for patient {patient_id}."

    lines = []
    for _, row in patient_rows.iterrows():
        lines.append(
            f"- {row['date_slot'].strftime('%Y-%m-%d %H:%M')} | Dr. {row['doctor_name'].title()} | {row['specialization']}"
        )

    return f"Patient {patient_id} has {len(patient_rows)} appointment(s):\n" + "\n".join(lines)


@tool
def get_doctors_list() -> str:
    """Get a list of all doctors and their specializations."""
    df = _load_csv()
    doctors = df[["doctor_name", "specialization"]].drop_duplicates()

    lines = []
    for _, row in doctors.iterrows():
        lines.append(f"- Dr. {row['doctor_name'].title()} ({row['specialization']})")

    return f"Available doctors ({len(lines)}):\n" + "\n".join(sorted(set(lines)))


# Export tools for easy access
READ_TOOLS = [get_available_slots, get_patient_appointments, get_doctors_list]
