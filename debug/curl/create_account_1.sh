#!/bin/bash
# LOCALHOST ONLY

curl -vvv \
  -H "content-type: application/json" \
  --data '{"username": "echelon", "password": "testing", "password_confirmation": "testing", "email_address": "echelon@gmail.com"}' \
  http://localhost:12345/create_account
