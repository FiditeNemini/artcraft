fakeyou-frontend
================

Frontend website for https://fakeyou.com/ (previously https://vo.codes)

Hosted with netlify.

Installation in Dev
-------------------

Normally, `npm install` in the `./fakeyou` directory works, but Mac needed
the following workaround for a [sass build failure](https://stackoverflow.com/a/67242989): 

```
nvm install 14
```


Logo, Favicon, Font
-------------------
Font: fugaz one, 110, #209CEE

Using https://favicon.io/favicon-generator/

Transparent Images
------------------
https://www.remove.bg (pretty cheap)gt


Social Icons
------------
Taken from subscription service https://www.flaticon.com

This pack: https://www.flaticon.com/packs/social-logo-1

Video Thumbnails
----------------
Generated with https://ezgif.com/

* webp, 500x300px (~100kb each)

Reverse clips:

```
ffmpeg -i input.mp4 -vf reverse reversed.mp4
```

