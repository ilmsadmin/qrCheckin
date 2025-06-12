#!/bin/bash

# Test login with GraphQL
echo "Testing login with GraphQL API..."

curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { access_token user { id email username firstName lastName role } } }",
    "variables": {
      "input": {
        "email": "toan@zplus.vn",
        "password": "ToanLinh"
      }
    }
  }' | jq
