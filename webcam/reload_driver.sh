#!/bin/bash
# https://github.com/webcamoid/akvcam/wiki/Debugging-the-driver

set -euxo pipefail

pushd akvcam/src

sudo modprobe videodev

sudo rmmod akvcam.ko

#sudo insmod akvcam.ko
sudo insmod akvcam.ko loglevel=7

#sudo modprobe akvcam loglevel=7

popd

