use std::env;
use std::path::PathBuf;

pub fn main() {
  // NB: This should help JetBrains' RustRover from highlighting failing query macros,
  // but we do not want to interfere with the following: 
  // 
  //    (1) User development builds
  //    (2) Tooling to cache offline queries
  //    (3) CI builds
  let family = env::var("CARGO_CFG_TARGET_FAMILY").ok();

  match family.as_deref() {
    Some("windows") => {
      if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
        let mut path = PathBuf::from(local_app_data);
        path = path.join("Temp\\tasks.sqlite");
        println!("cargo:warning=LocalAppData path: {}", path.display());
        println!("cargo:rustc-env=DATABASE_URL=sqlite:{}", path.to_str().unwrap_or(""));
        // Use `path` here...
      } else {
        panic!("LOCALAPPDATA environment variable not set");
      }
    },
    Some("unix") => {
      println!("cargo:rustc-env=DATABASE_URL=sqlite:/tmp/tasks.sqlite");
    },
    _ => {
      println!("cargo:warning=Unsupported target family, using default path.");
      println!("cargo:rustc-env=DATABASE_URL=sqlite:/tmp/tasks.sqlite");
    },
  }
}