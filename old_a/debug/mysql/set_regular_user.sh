#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "update users set user_role_slug='user' where username='echelon' limit 1\G"
