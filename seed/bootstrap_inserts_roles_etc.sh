#!/bin/bash
# ONLY FOR LOCAL DEV


# --default-character-set=UTF8mb4 \
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "source ./seed/sql/system_roles.sql"


