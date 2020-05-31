#!/bin/sh

# We can't run this as a CronJob since it isn't guranteed to be scheduled
# to the same nodes. (Maybe there's a way for Kubernetes to do that?)

mkdir -p "${DOWNLOAD_DIR}"
mkdir -p "${TEMP_DIR}"

while :; do
  ./do_spaces_downloader
  sleep 60
done

