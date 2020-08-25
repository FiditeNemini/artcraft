Storyteller
===========

A startup, by Brandon Thomas.

Webcam
------

Docs and software:

- software: https://github.com/webcamoid/akvcam
- wiki: https://github.com/webcamoid/akvcam/wiki/Usage-and-examples

The configuration I use is as follows:

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


Models
------
Models are sourced from the following websites:

* https://www.models-resource.com/


