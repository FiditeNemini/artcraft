Windows-specific notes
======================

Setting up the development environment
--------------------------------------

### Install NVM, NPM, and Yarn

1. Install [Windows nvm](https://github.com/coreybutler/nvm-windows/releases)
2. Run `nvm install 14.15.0` (newer versions such as "18.6.0" are broken at time of writing)
3. Run `nvm use 14.15.0` from an Administrator console. 
   To enable admin rights, right click and run the terminal as administrator.
4. Run `npm i -g corepack` from an Administrator console. (This installs `yarn`.)

Running the project
--------------------

1. Run `yarn install`
2. Run `yarn start-w

(You may need to run one or both of these commands *twice* for it to work.)


Fixing common errors
--------------------

> Node Sass does not yet support your current environment: Windows 64-bit with Unsupported runtime (108)

Install an older version of npm. (You probably won't have to mess with SASS.)
https://stackoverflow.com/a/64645028
