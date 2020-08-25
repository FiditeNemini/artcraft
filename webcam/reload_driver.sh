#!/bin/bash

set -euxo pipefail

pushd akvcam/src

sudo modprobe videodev

sudo rmmod akvcam.ko

sudo insmod akvcam.ko

popd

