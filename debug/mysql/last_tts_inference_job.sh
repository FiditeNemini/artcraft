#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u root \
  -proot \
  -h localhost \
  -D storyteller \
  -e "select * from tts_inference_jobs\G"
