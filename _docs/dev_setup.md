Dev Setup
=========

# ArtCraft 

ArtCraft is a Rust / Tauri app.

To set up the ArtCraft development environment,  install the following:

1. [Install Rust](https://doc.rust-lang.org/cargo/getting-started/installation.html).
2. [Install npm](https://nodejs.org/en/download) or [nvm](https://github.com/nvm-sh/nvm).
3. [Install nx](https://nx.dev/docs/getting-started/installation). 
4. [Install Tauri CLI](https://v2.tauri.app/reference/cli/).

An easy way to get started with running the app in development is to run the two commands (in separate terminals):

```bash
# Run the frontend dev server
./script/artcraft/unix_frontend_dev.sh

# Run the Tauri Rust application
./script/artcraft/unix_rust_dev.sh
```

# ArtCraft Server

ArtCraft's server is a Rust / Actix app called `storyteller-web`.

It can function entirely within the development environment, and ArtCraft can be pointed to a 
local instance of the server.

**TODO**: Concisely describe setting up server components. Note: we have 
previous docs in `old/` that may still be relevant, though they're perhaps
slightly out of date.
