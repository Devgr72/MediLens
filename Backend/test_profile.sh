#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlcnhAZXhhbXBsZS5jb20iLCJleHAiOjE3NzM0OTM5ODh9.8Qv2TbDlBnRpaENw0XqJ39xCt5yod9O1eLMhoO5WVMI"

echo "1. Adding a family member (Father)..."
curl -X POST "http://127.0.0.1:8000/api/v1/users/family-member" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Ramesh Kumar",
           "age": 60,
           "gender": "Male",
           "relationship": "Father"
         }'

echo "\n\n2. Adding a family member (Mother)..."
curl -X POST "http://127.0.0.1:8000/api/v1/users/family-member" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Sita Devi",
           "age": 55,
           "gender": "Female",
           "relationship": "Mother"
         }'

echo "\n\n3. Fetching User Profile..."
curl -X GET "http://127.0.0.1:8000/api/v1/users/profile" \
     -H "Authorization: Bearer $TOKEN"
