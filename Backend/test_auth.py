import requests

BASE_URL = "http://localhost:8000/api/v1"

# 1. Login to get a token (assuming a user test@example.com exists, or we register one)
r = requests.post(f"{BASE_URL}/users/register", json={
    "full_name": "Test User",
    "email": "testauth@example.com",
    "password": "password123"
})
print("Register:", r.status_code, r.text)

r = requests.post(f"{BASE_URL}/users/login", json={
    "email": "testauth@example.com",
    "password": "password123"
})
print("Login:", r.status_code, r.text)

token = None
if r.status_code == 200:
    token = r.json()["access_token"]

if token:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "summary": "Test Summary",
        "potential_causes": [],
        "alternative_conditions": [],
        "risk_level": "LOW",
        "triage_level": "Home Care",
        "triage_advice": "Rest",
        "severity_score": 1,
        "visual_findings": "",
        "suspected_condition": "Fatigue",
        "reasoning": "Test",
        "first_aid": [],
        "watch_for": [],
        "specialist": "None",
        "recommended_specialists": [],
        "ai_confidence": "HIGH",
        "sources": [],
         "note": ""
    }
    r2 = requests.post(f"{BASE_URL}/symptoms/history", headers=headers, json=payload)
    print("Save History:", r2.status_code, r2.text)
    
    # Also test doctor appointments endpoint
    r3 = requests.get(f"{BASE_URL}/appointments/doctor", headers=headers)
    print("Doctor Appointments:", r3.status_code, r3.text)

