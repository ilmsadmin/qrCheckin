#!/bin/bash
# Simple API test script

# Configuration
API_URL="http://localhost:4000/graphql"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Running QR Check-in API Tests"
echo "================================="

# Login test with admin user
echo -e "\n📝 Testing Login with admin user..."
LOGIN_QUERY='{
  "query": "mutation { login(input: { email: \"admin@qrcheckin.com\", password: \"admin123\" }) { access_token user { id email username role } } }"
}'

LOGIN_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "$LOGIN_QUERY")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  # Extract token for further requests
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
  echo "Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
fi

# Get users test (admin only)
echo -e "\n📝 Testing Users Query (admin access)..."
USERS_QUERY='{
  "query": "query { users { id email username role } }"
}'

USERS_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$USERS_QUERY")

if echo "$USERS_RESPONSE" | grep -q "\"data\":{\"users\":\[{"; then
  echo -e "${GREEN}✓ Users query successful${NC}"
  USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o "\"id\"" | wc -l)
  echo "Retrieved $USER_COUNT users"
else
  echo -e "${RED}✗ Users query failed${NC}"
  echo "$USERS_RESPONSE"
fi

# Get clubs test
echo -e "\n📝 Testing Clubs Query..."
CLUBS_QUERY='{
  "query": "query { clubs { id name description } }"
}'

CLUBS_RESPONSE=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$CLUBS_QUERY")

if echo "$CLUBS_RESPONSE" | grep -q "\"data\":{\"clubs\":\[{"; then
  echo -e "${GREEN}✓ Clubs query successful${NC}"
  CLUB_COUNT=$(echo "$CLUBS_RESPONSE" | grep -o "\"id\"" | wc -l)
  echo "Retrieved $CLUB_COUNT clubs"
else
  echo -e "${RED}✗ Clubs query failed${NC}"
  echo "$CLUBS_RESPONSE"
fi

echo -e "\n✅ API test completed"
