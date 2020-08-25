#!/bin/bash

#set -euxo pipefail

echo "\n\n[cloning repo]\n\n"
yes | rm -r akvcam

git clone https://github.com/webcamoid/akvcam.git

echo "\n\n[building and installing extension]\n\n"

pushd akvcam/src
make
sudo make install

sudo modprobe videodev

sudo rmmod akvcam.ko

sudo insmod akvcam.ko

echo "\n\n[this should show the webcam extension]\n\n"
ls /lib/modules/$(uname -r)/extra/akvcam.ko*

popd

