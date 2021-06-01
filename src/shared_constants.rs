//! Shared constants that all binaries use.

/// NB: `sqlx::query` is spammy and dumps all queries as "info"-level log lines.
/// NB: `hyper::proto::h1::io` is incredibly spammy and logs every chunk of bytes in very large files being downloaded.
pub const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info,sqlx::query=warn,hyper::proto::h1::io=warn";
//const DEFAULT_RUST_LOG: &'static str = "debug,actix_web=info"; // but sometimes we want to debug

/// The default MySql password for use in development
pub const DEFAULT_MYSQL_PASSWORD: &'static str = "mysql://storyteller:password@localhost/storyteller";
