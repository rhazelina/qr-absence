#!/bin/bash

# Define API URL
API_URL="http://localhost:8000/api"

# Login
echo "Logging in..."
LOGIN_RES=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "walikelas1", "password": "password123"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed: $LOGIN_RES"
  exit 1
fi

echo "Token obtained."

# Get Students
echo "Getting Homeroom Students..."
curl -s -X GET "$API_URL/me/homeroom/students" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

echo -e "\n"

# Get Attendance
TODAY=$(date +%Y-%m-%d)
echo "Getting Attendance for $TODAY..."
curl -s -X GET "$API_URL/me/homeroom/attendance?from=$TODAY&to=$TODAY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

echo -e "\n"
