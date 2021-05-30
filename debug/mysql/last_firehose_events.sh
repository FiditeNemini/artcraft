#!/bin/bash
# ONLY FOR LOCAL DEV
mysql -u root \
  -proot \
  -h localhost \
  -D storyteller \
  -e "select * from firehose_entries\G"
