Storyteller
===========

A startup, by Brandon Thomas.

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

Models
------
Models are sourced from the following websites:

* https://www.models-resource.com/


