fakeyou-frontend
================

TODO: 

- Rename storyteller -> create-storyteller
- Move static storyteller -> packages/, 
- Merge in other frontends
- Merge with backend and use protos for API?
- Rename this repo to `storyteller-frontend`
- ~~Upgrade to React 18~~ Carefully upgrade react. OMG. Also tests in place to ensure builds.

Develop locally without CORS:
------------

```
chromium-browser --disable-web-security --user-data-dir=~/chrome
```

Or Mac,

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --disable-web-security --user-data-dir=~/chrome
```

To add local libraries from the monorepo as dependencies
--------------------------------------------------------

eg, to add the common "components" package to the "storyteller-home" website,

```
yarn workspace @storyteller/storyteller-home add file file:../components (ACTUALLY, THIS MAY HAVE ISSUES)
```

NB: This is now a MONOREPO
--------------------------

Based on https://medium.com/geekculture/setting-up-monorepo-with-create-react-app-cb2cfa763b96,
which isn't the best guide, but it works.

Library code is exported in the library's index.tsx (meh)

To start the react server, run "yarn start-storyteller" or "yarn start-fakeyou"

### Running

```
# Install Yarn if not present (Linux/Mac)
sudo npm install --global yarn

# We might need a newer node (Linux/Mac)
sudo install n -g
sudo n stable

# Install project deps (Linux/Mac)
yarn install

# Start one or more of the several frontends (Linux/Mac)
yarn start-fakeyou
yarn start-storyteller
```

TODO: Upgrade React, it's a bit behind. See downgrade @ SHA
`d739b66bfa3315620208579193d652e8e460da1e`.

Good Code Examples
------------------

* `storyteller/src/pages/tts_configs/TtsConfigsEditRulePage.tsx` - Tree of components that handle a very complicated update API

Documentation
-------------

docs.fakeyou.com is generated from `./docs` using [Docsify](https://docsify.js.org/).

To run and test locally,

```bash
sudo npm i docsify-cli -g
docsify serve docs
```


Netlify Notes
-------------

The `.node-version` file controls which version of node Netlify uses to build!

Old Readme Follows
------------------

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

