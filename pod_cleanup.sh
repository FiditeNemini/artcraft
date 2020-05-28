#!/bin/bash

# For some reason, pods aren't going away after they're marked for deletion. 
# They're getting stuck as "Terminating" for days at a time, leading to an 
# accumulation of limitless stale pods.
#
# I'm not sure what the cause is, but there are lots of reports of this on
# Google. 
#
# One thing I uncovered (in kubernetes events) that might be related:
#
# 22m         Normal    TaintManagerEviction     pod/{name}    Marking for deletion Pod {name}
#
# But I honestly don't know what is causing this. Perhaps the fuse filesytem?
# Perhaps DigitalOcean weirdness?
#
# This stop-gap non-solution is taken from https://stackoverflow.com/q/50336665
#
function cleanup_pods() {
  namespace=$1

  echo "Cleanup pods in namespace ${namespace}"

  pods=$( kubectl -n ${namespace} get pods | grep -v Running | tail -n +2 | awk -F " " '{print $1}' )

  for pod in $pods;
  do
    echo "Deleting pod ${pod}"
    kubectl -n ${namespace} delete pod $pod --grace-period=0 --force 2> /dev/null
  done
}

cleanup_pods "mumble"
cleanup_pods "trumped"

