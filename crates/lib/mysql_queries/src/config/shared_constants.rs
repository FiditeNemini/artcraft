// TODO(bt,2024-06-28): Phase these out

/// The default MySql connection string for use in development
pub const DEFAULT_MYSQL_CONNECTION_STRING: &str = "mysql://storyteller:password@localhost/storyteller";

/// The number of results we return by default for paginated queries.
pub const DEFAULT_MYSQL_QUERY_RESULT_PAGE_SIZE: u16 = 25;
