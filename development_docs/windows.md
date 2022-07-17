Windows-specific notes
======================

Setting up the development environment
--------------------------------------

### Install NVM / NPM 

1. Install [Windows nvm](https://github.com/coreybutler/nvm-windows/releases)
2. Run `nvm install latest` (which is version "18.6.0" at time of writing)
3. Run `nvm use (version number)` from an Administrator console. 
   To enable admin rights, right click and run the terminal as administrator.

### Install Yarn

1. Run `npm i -g corepack` from an Administrator console.
2. Run `yarn init -2` from the repository.


Running the project
--------------------

1. Run `yarn install`