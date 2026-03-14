"""
MediLens AI — Appointment Service

Handles booking consultations between a patient and a doctor, linking an AI assessment.
"""

from typing import List
from fastapi import HTTPException, status
from bson.objectid import ObjectId

from app.config.database import get_database
from app.models.appointment_model import appointment_document
from app.core.logger import logger

APPOINTMENTS = "appointments"
DOCTORS = "doctors"
USERS = "users"
SYMPTOM_CHECKS = "symptom_checks"

async def book_consultation(user_email: str, payload_dict: dict) -> dict:
    """Creates a new appointment linking user, doctor, and AI report."""
    db = get_database()
    
    doctor_id = payload_dict.get("doctor_id")
    assessment_id = payload_dict.get("assessment_id")
    
    if not doctor_id or not assessment_id:
        raise HTTPException(status_code=400, detail="doctor_id and assessment_id are required")

    # Verify doctor exists and is approved
    doctor = await db[DOCTORS].find_one({"_id": ObjectId(doctor_id), "account_status": "approved"})
    if not doctor:
        logger.error(f"Failed to book: Doctor {doctor_id} not found or not approved")
        raise HTTPException(status_code=404, detail="Doctor not found or not approved for consultations")
        
    # Verify assessment exists and belongs to the user
    # Note: AI history is saved with user_email, and MongoDB ObjectId as string
    try:
        report = await db[SYMPTOM_CHECKS].find_one({"_id": ObjectId(assessment_id), "user_email": user_email})
    except Exception as e:
        logger.error(f"Failed to lookup assessment {assessment_id}: {e}")
        report = None
        
    if not report:
        logger.error(f"Failed to book: Assessment {assessment_id} for user {user_email} not found")
        raise HTTPException(status_code=404, detail="Assessment not found or you don't have access")
        
    # Create the appointment
    doc = appointment_document(
        user_email=user_email,
        doctor_id=doctor_id,
        assessment_id=assessment_id,
        status="pending"
    )
    
    result = await db[APPOINTMENTS].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    
    # ── Populate Patient and Assessment details for response ──
    patient = await db[USERS].find_one({"email": user_email})
    doc["patient_details"] = {
        "name": patient.get("full_name", "Unknown") if patient else "Unknown",
        "email": user_email
    }
    
    doc["assessment_report"] = report.get("result", {}) if report else {}
    
    logger.info("Appointment booked: %s to see Doctor %s", user_email, doctor_id)
    return doc

async def get_doctor_appointments(doctor_email: str) -> List[dict]:
    """Retrieves all appointments for a given doctor, populating patient info and reports."""
    db = get_database()
    
    # 1. Get the doctor's ObjectId string
    doctor = await db[DOCTORS].find_one({"email": doctor_email})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    doctor_id_str = str(doctor["_id"])
    
    # 2. Find all appointments for this doctor
    cursor = db[APPOINTMENTS].find({"doctor_id": doctor_id_str}).sort("created_at", -1)
    appointments = await cursor.to_list(length=100)
    
    # 3. Populate Patient and Assessment details
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
        
        # Patient Info
        patient = await db[USERS].find_one({"email": apt["user_email"]})
        if patient:
            apt["patient_details"] = {
                "name": patient.get("full_name", "Unknown"),
                "email": patient.get("email")
            }
            
        # Assessment Info
        try:
            report = await db[SYMPTOM_CHECKS].find_one({"_id": ObjectId(apt["assessment_id"])})
            if report and "result" in report:
                apt["assessment_report"] = report["result"]
        except Exception:
            pass
            
    return appointments
