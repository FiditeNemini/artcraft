#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u storyteller \
  -ppassword \
  -h localhost \
  -D storyteller \
  -e "select * from tts_models\G"
