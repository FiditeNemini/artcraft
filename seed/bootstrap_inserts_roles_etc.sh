#!/bin/bash
# ONLY FOR LOCAL DEV

# --default-character-set=UTF8mb4 \

echo 'Inserting System User Roles...'
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "source ./seed/sql/system_roles.sql"

echo 'Inserting Badges...'
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "source ./seed/sql/user_badges.sql"


