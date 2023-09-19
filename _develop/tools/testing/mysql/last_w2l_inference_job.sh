#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u root \
  -proot \
  -h localhost \
  -D storyteller \
  -e "select * from w2l_inference_jobs\G"
