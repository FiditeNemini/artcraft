#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "select * from ip_address_bans\G"
