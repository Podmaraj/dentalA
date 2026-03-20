"""CSV write operations — mutation tools for the dental appointment system.

Includes file locking for concurrency safety and event broadcasting
for real-time SSE updates.
"""

import threading
import pandas as pd
from langchain_core.tools import tool
from dental_agent.config.settings import CSV_PATH
from dental_agent.events import broadcast_event

# Module-level lock for CSV file access
_csv_lock = threading.Lock()


def _load_csv() -> pd.DataFrame:
    """Load the CSV file into a DataFrame."""
    df = pd.read_csv(CSV_PATH)
    df["date_slot"] = pd.to_datetime(df["date_slot"])
    df["is_available"] = df["is_available"].astype(str).str.upper() == "TRUE"
    return df


def _save_csv(df: pd.DataFrame) -> None:
    """Save the DataFrame back to CSV."""
    save_df = df.copy()
    save_df["is_available"] = save_df["is_available"].map({True: "TRUE", False: "FALSE"})
    save_df["date_slot"] = save_df["date_slot"].dt.strftime("%Y-%m-%d %H:%M:%S")
    save_df.to_csv(CSV_PATH, index=False)


@tool
def book_appointment(patient_id: str, doctor_name: str, date_slot: str) -> str:
    """Book an appointment for a patient with a specific doctor at a given date/time slot.
    date_slot should be in format YYYY-MM-DD HH:MM."""
    with _csv_lock:
        df = _load_csv()

        # Find the matching slot
        mask = (
            (df["doctor_name"].str.lower() == doctor_name.lower())
            & (df["date_slot"].dt.strftime("%Y-%m-%d %H:%M") == date_slot)
        )

        matching = df[mask]
        if matching.empty:
            return f"Error: No slot found for Dr. {doctor_name.title()} at {date_slot}."

        row_idx = matching.index[0]
        if not df.at[row_idx, "is_available"]:
            current_patient = df.at[row_idx, "patient_to_attend"]
            return f"Error: This slot is already booked by patient {current_patient}."

        # Book the slot
        df.at[row_idx, "is_available"] = False
        df.at[row_idx, "patient_to_attend"] = str(patient_id)
        _save_csv(df)

        spec = df.at[row_idx, "specialization"]

    # Broadcast event outside lock
    broadcast_event("slot_booked", {
        "patient_id": patient_id,
        "doctor_name": doctor_name.title(),
        "date_slot": date_slot,
        "specialization": spec,
    })

    return (
        f"Successfully booked appointment!\n"
        f"- Patient ID: {patient_id}\n"
        f"- Doctor: Dr. {doctor_name.title()}\n"
        f"- Date/Time: {date_slot}\n"
        f"- Specialization: {spec}"
    )


@tool
def cancel_appointment(patient_id: str, date_slot: str) -> str:
    """Cancel an appointment for a patient at a given date/time slot.
    date_slot should be in format YYYY-MM-DD HH:MM."""
    with _csv_lock:
        df = _load_csv()
        df["patient_to_attend"] = df["patient_to_attend"].astype(str).str.strip()

        # Find the matching appointment
        mask = (
            (df["patient_to_attend"] == str(patient_id))
            & (df["date_slot"].dt.strftime("%Y-%m-%d %H:%M") == date_slot)
        )

        matching = df[mask]
        if matching.empty:
            return f"Error: No appointment found for patient {patient_id} at {date_slot}."

        row_idx = matching.index[0]
        doctor = df.at[row_idx, "doctor_name"]
        spec = df.at[row_idx, "specialization"]

        # Cancel the appointment
        df.at[row_idx, "is_available"] = True
        df.at[row_idx, "patient_to_attend"] = ""
        _save_csv(df)

    # Broadcast event outside lock
    broadcast_event("slot_cancelled", {
        "patient_id": patient_id,
        "doctor_name": doctor.title(),
        "date_slot": date_slot,
        "specialization": spec,
    })

    return (
        f"Successfully cancelled appointment!\n"
        f"- Patient ID: {patient_id}\n"
        f"- Doctor: Dr. {doctor.title()}\n"
        f"- Cancelled slot: {date_slot}"
    )


@tool
def reschedule_appointment(patient_id: str, old_date_slot: str, new_date_slot: str, doctor_name: str = "") -> str:
    """Reschedule an appointment from old_date_slot to new_date_slot.
    Both slots should be in format YYYY-MM-DD HH:MM.
    If doctor_name is not provided, uses the same doctor from the original appointment."""
    with _csv_lock:
        df = _load_csv()
        df["patient_to_attend"] = df["patient_to_attend"].astype(str).str.strip()

        # Find the old appointment
        old_mask = (
            (df["patient_to_attend"] == str(patient_id))
            & (df["date_slot"].dt.strftime("%Y-%m-%d %H:%M") == old_date_slot)
        )
        old_matching = df[old_mask]
        if old_matching.empty:
            return f"Error: No appointment found for patient {patient_id} at {old_date_slot}."

        old_idx = old_matching.index[0]
        original_doctor = df.at[old_idx, "doctor_name"]
        target_doctor = doctor_name if doctor_name else original_doctor

        # Find the new slot
        new_mask = (
            (df["doctor_name"].str.lower() == target_doctor.lower())
            & (df["date_slot"].dt.strftime("%Y-%m-%d %H:%M") == new_date_slot)
        )
        new_matching = df[new_mask]
        if new_matching.empty:
            return f"Error: No slot found for Dr. {target_doctor.title()} at {new_date_slot}."

        new_idx = new_matching.index[0]
        if not df.at[new_idx, "is_available"]:
            return f"Error: The new slot at {new_date_slot} is already booked."

        # Cancel old slot
        df.at[old_idx, "is_available"] = True
        df.at[old_idx, "patient_to_attend"] = ""

        # Book new slot
        df.at[new_idx, "is_available"] = False
        df.at[new_idx, "patient_to_attend"] = str(patient_id)
        _save_csv(df)

        spec = df.at[new_idx, "specialization"]

    # Broadcast event outside lock
    broadcast_event("slot_rescheduled", {
        "patient_id": patient_id,
        "doctor_name": target_doctor.title(),
        "old_date_slot": old_date_slot,
        "new_date_slot": new_date_slot,
        "specialization": spec,
    })

    return (
        f"Successfully rescheduled appointment!\n"
        f"- Patient ID: {patient_id}\n"
        f"- Doctor: Dr. {target_doctor.title()}\n"
        f"- Old slot: {old_date_slot}\n"
        f"- New slot: {new_date_slot}\n"
        f"- Specialization: {spec}"
    )


# Export tools for easy access
WRITE_TOOLS = [book_appointment, cancel_appointment, reschedule_appointment]
