Storyteller
===========

A startup, by Brandon Thomas.

Installation / Requirements
---------------------------
Install the following packages on Linux:

* clang
* cmake
* libsdl2-dev
* libxcb-xfixes0-dev
* GLFW build requirements:
  * libpthread (eg. libpthread-stubs0-dev)
  * libx11-dev
  * libxcursor-dev
  * libxi-dev
  * libxinerama-dev
  * libxrandr-dev

Supporting devices over USB in Linux
------------------------------------
Sometimes the cameras just won't work. We need to increase USB memory and
copy a device config file.

Modify this:

```
sudo sh -c 'echo 2047 > /sys/module/usbcore/parameters/usbfs_memory_mb'
```

Grub bootloader modifications:

```
sudo vi /etc/default/grub
```

Then modify this directive to add the following:

```
GRUB_CMDLINE_LINUX_DEFAULT="[KEEP EXISTING PARTS THE SAME] usbcore.usbfs_memory_mb=2047"
```

Then

```
sudo update-grub
```

(Reboot)

If `sudo k4aviewer` works but non-sudo doesn't,

```
git clone git@github.com:microsoft/Azure-Kinect-Sensor-SDK.git
cd Azure-Kinect-Sensor-SDK/
sudo cp scripts/99-k4a.rules /etc/udev/rules.d/
```

Then disconnect and reconnect the USB device. It should work now.

Ubuntu 18.04 Installation
-------------------------

Configure the Microsoft PPA and install the packages:

```
# Configure PPA
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo apt-add-repository https://packages.microsoft.com/ubuntu/18.04/prod
sudo apt-get update

#Install packages:
sudo apt install k4a-tools
sudo apt install libk4a1.1-dev
```


Ubuntu 20.04 LTS Support
------------------------

Azure Kinect isn't officially supported on 20.04

mpdroid's comment on October 17, 2020 seems to indicate that there is a workaround:

https://feedback.azure.com/forums/920053-azure-kinect-dk/suggestions/40368301-support-for-ubuntu-20-04-lts?page=1&per\_page=20

```
These are the steps I followed to install k4a-tools, libk4a and libk4abt on Ubuntu 20.04. The general steps are as outlined in
https://docs.microsoft.com/en-us/azure/Kinect-dk/sensor-sdk-download, with a couple of hacks to make things work on 20.04.
- use of 18.04 repo, even though OS is 20.04
- installed lower versions of tools and libraries (as latest versions of sensor and body tracker don't seem to be compatible on 20.04)

$ curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
$ sudo apt-add-repository https://packages.microsoft.com/ubuntu/18.04/prod
$ curl -sSL https://packages.microsoft.com/config/ubuntu/18.04/prod.list | sudo tee /etc/apt/sources.list.d/microsoft-prod.list
$ curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
$ sudo apt-get update
$ sudo apt install libk4a1.3-dev
$ sudo apt install libk4abt1.0-dev
$ sudo apt install k4a-tools=1.3.0

- Verify sensor library by launching camera viewer

$ k4aviewer

- Clone and build [Azure Kinect Samples](https://github.com/microsoft/Azure-Kinect-Samples).
- Run `simple_3d_viewer` to verify body tracker works.
```

There will be complaints:

```
# E: The repository 'https://packages.microsoft.com/ubuntu/18.04/prod focal Release' does not have a Release file.
# N: Updating from such a repository can't be done securely, and is therefore disabled by default.
```

Just ignore them.

Webcam
------

Update:

This seems to work with some combination of reloading the driver (`./webcam/reload_driver.sh`), running VLC
(maybe it sets the video buffer mode?), killing firefox, and starting random browsers and going to meet.
Eventually it seems to work.

Docs and software:

- software: https://github.com/webcamoid/akvcam
- wiki: https://github.com/webcamoid/akvcam/wiki/Usage-and-examples

The configuration I use is as follows (this may have changed with the new ini file):

- /dev/video0 is the input
- /dev/video1 is the output

Check to see if the driver is okay:

```
v4l2-compliance -d /dev/video0 -f
```

Check properties:

```
v4l2-ctl -d /dev/video0
```

Playback:

```
ffplay /dev/video1
```

Test writing random noise:

```
cat /dev/urandom > /dev/video0
```

This may have the answers for my bugs:

- https://github.com/webcamoid/akvcam/issues/6

3D Models / Assets
------------------
Models are sourced from the following websites:

* https://www.models-resource.com/


