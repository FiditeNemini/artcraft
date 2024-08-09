
#[derive(Debug)]
pub enum DatabaseQueryError {
  /// A duplicate idempotency token error occurred.
  /// This should be surfaced as a 400 to the user.
  IdempotencyDuplicateKeyError,

  /// An uncategorized error occurred.
  /// This will likely result in a 500 for the user.
  SqlxError(sqlx::Error),

  /// An uncategorized non-database error occurred.
  /// This will likely result in a 500 for the user.
  AnyhowError(anyhow::Error),
}

impl From<anyhow::Error> for DatabaseQueryError {
  fn from(err: anyhow::Error) -> Self {
    DatabaseQueryError::AnyhowError(err)
  }
}

impl From<sqlx::Error> for DatabaseQueryError {
  fn from(err: sqlx::Error) -> Self {
    DatabaseQueryError::SqlxError(err)
  }
}

impl DatabaseQueryError {
  /// Whether we should surface this failure as a 400 to the user.
  /// This could be any field (for now we only have the idempotency token).
  pub fn is_400_error(&self) -> bool {
    match self {
      DatabaseQueryError::IdempotencyDuplicateKeyError => true,
      _ => false,
    }
  }

  /// Whether we should surface this failure as a 400 to the user.
  /// Specifically, if we know it was the idempotency token.
  pub fn had_duplicate_idempotency_token(&self) -> bool {
    match self {
      DatabaseQueryError::IdempotencyDuplicateKeyError => true,
      _ => false,
    }
  }
}
