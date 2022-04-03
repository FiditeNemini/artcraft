#!/bin/bash
# LOCALHOST ONLY

curl -vvv \
  -H "content-type: application/json" \
  --data '{"username_or_email": "nobody", "password": "testing"}' \
  http://localhost:12345/login
