AI Chatbot Sidecar
==================

This is the first app that doesn't run as a part of our SoA API architecture. (Though it is written such that we 
could port it.) This app is responsible for generating all the content that goes into our streaming AI-powered TV
programs.

### Windows Installation

The application uses sqlite, which is tricky to install on Windows.

1. Put together an sqlite build directory containing the sources and dll file. One is checked in under this monorepo 
   in ./windows/sqlite at the time of this writing, though that may change in the future.

2. Add environment variables for the sqlite build directory (see https://github.com/diesel-rs/diesel/issues/487)

    * PATH (append the sqlite build directory to the end)
    * SQLITE3_LIB_DIR (a new environment variable; set it to the sqllite build path)


3. Build the `sqlite3.lib` file with the following:

   ```
   lib /def:sqlite3.def /out:sqlite3.lib /MACHINE:amd64 
   ```
   
   This must be done in "Developer Command Prompt for VS 2022" (or similar), not `cmd` or `PowerShell`.

4. Run the diesel_cli tool build  
   ```
   cargo install diesel_cli --no-default-features --features sqlite
   ```

   If it still complains about the `sqlite3.lib` file not being found, be sure to double check that `echo %PATH%` shows 
   the updated PATH from the steps above.

