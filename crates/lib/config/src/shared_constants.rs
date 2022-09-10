//! Shared constants that all binaries use.
//! Or at least that deserve extremely high visibility.

/// NB: `sqlx::query` is spammy and dumps all queries as "info"-level log lines.
/// NB: `hyper::proto::h1::io` is incredibly spammy and logs every chunk of bytes in very large files being downloaded.
pub const DEFAULT_RUST_LOG: &'static str = concat!(
  "debug,",
  "actix_web=info,",
  "sqlx::query=warn,",
  "hyper::proto::h1::io=warn,",
  "storyteller_web::threads::db_health_checker_thread::db_health_checker_thread=warn,",
  "http_server_common::request::get_request_ip=info," // Debug spams Rust logs
);

/// The default Redis connection string for use in development
pub const DEFAULT_REDIS_DATABASE_0_CONNECTION_STRING: &'static str = "redis://localhost/0";

/// The default Redis connection string for use in development
/// Database 1
pub const DEFAULT_REDIS_DATABASE_1_CONNECTION_STRING: &'static str = "redis://localhost/1";

/// The default MySql connection string for use in development
pub const DEFAULT_MYSQL_CONNECTION_STRING: &'static str = "mysql://storyteller:password@localhost/storyteller";

/// The number of results we return by default for paginated queries.
pub const DEFAULT_MYSQL_QUERY_RESULT_PAGE_SIZE: u16 = 25;
