#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlcnhAZXhhbXBsZS5jb20iLCJleHAiOjE3NzM0OTgyNzB9.wSkpB8WSgTWhB7bbcKTUpflbrd9gwEAt3QKmlbGKlEY"

echo "1. Saving a mock AI History result..."
curl -X POST "http://127.0.0.1:8000/api/v1/symptoms/history" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
          "summary": "Patient exhibits signs of a common cold.",
          "potential_causes": [
            "Viral infection"
          ],
          "alternative_conditions": [
            {
              "condition": "Allergies",
              "reason": "Similar nasal symptoms"
            }
          ],
          "risk_level": "Low",
          "triage_level": "Level 5",
          "triage_advice": "Rest and hydration.",
          "severity_score": 2,
          "visual_findings": "None",
          "suspected_condition": "Common Cold",
          "reasoning": "Symptoms match typical rhinovirus presentation.",
          "first_aid": [
            "Drink plenty of fluids"
          ],
          "watch_for": [
            "High fever"
          ],
          "specialist": "General Physician",
          "ai_confidence": "High",
          "sources": [
            "Mayo Clinic"
          ],
          "note": "Get well soon"
        }'

echo -e "\n\n2. Retrieving AI History results..."
curl -X GET "http://127.0.0.1:8000/api/v1/symptoms/history" \
     -H "Authorization: Bearer $TOKEN"
