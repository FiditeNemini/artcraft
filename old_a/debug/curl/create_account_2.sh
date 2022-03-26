#!/bin/bash
# LOCALHOST ONLY

curl -vvv \
  -H "content-type: application/json" \
  --data '{"username": "ernest", "password": "knowwhatimean", "password_confirmation": "knowwhatimean", "email_address": "vern@knowwhatimean.com"}' \
  http://localhost:12345/create_account
