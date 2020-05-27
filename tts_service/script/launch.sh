#!/bin/sh

# NB: libtorch currently segfaults, so we need to restart our app ourselves, 
# so Kubernetes won't CrashLoopBackOff us.
while :; do
  # local: ../target/release/tts_service
  ./tts_service
  sleep 2
done

