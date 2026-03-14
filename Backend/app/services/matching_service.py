"""
MediLens AI — Doctor Matching Service

Handles finding specialist doctors based on AI recommendations.
"""

from app.config.database import get_database
from fastapi import HTTPException, status
from typing import List

DOCTORS = "doctors"

async def find_matching_doctors(specialties: List[str]) -> List[dict]:
    """Find doctors whose specialization matches the requested ones and are approved."""
    if not specialties:
        return []

    db = get_database()
    
    # Clean the specialties array (e.g. handle exact matches, case insensitivity, or basic text search)
    # Using regex for flexible matching (e.g. "Cardiologist" matches "Cardiology", etc.)
    regex_pattern = "|".join([specialty.strip() for specialty in specialties])
    
    pipeline = [
        {
            "$match": {
                "account_status": "approved",
                "professional_details.specialization": {
                    "$regex": regex_pattern, 
                    "$options": "i"
                }
            }
        },
        # Select only the public profile fields safe to return to patient
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "basic_details.profile_photo": 1,
                "professional_details.specialization": 1,
                "professional_details.experience_years": 1,
                "consultation_details.consultation_fee": 1,
                "consultation_details.consultation_type": 1,
                "consultation_details.available_days": 1,
                "consultation_details.available_time": 1,
                "workplace_details.hospital_or_clinic_name": 1,
                "workplace_details.work_address.city": 1,
            }
        }
    ]
    
    cursor = db[DOCTORS].aggregate(pipeline)
    doctors = await cursor.to_list(length=100)
    
    # Format the ObjectId
    for doc in doctors:
        doc["_id"] = str(doc["_id"])
        
    return doctors
