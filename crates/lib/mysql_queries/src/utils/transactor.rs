// NB: Incrementally getting rid of build warnings...
#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use sqlx::mysql::{MySqlArguments, MySqlQueryResult};
use sqlx::query::Query;
use sqlx::{MySql, MySqlPool, Transaction};

/// Operate over various types of transactors
pub enum Transactor<'e, 't> {
  /// Transactions over a MySQL pool.
  /// This isn't always ideal as each operation acquires a new connection from the pool
  Pool {
    pool: &'e MySqlPool,
  },

  /// Transactions over an open connection.
  Connection {
    connection: &'e mut sqlx::MySqlConnection,
  },

  /// Operations over an open transaction.
  Transaction {
    transaction: &'e mut Transaction<'t, MySql>,
  },
}

impl <'e, 't>Transactor<'e, 't> {

  /// Constructor
  pub fn for_pool(pool: &'e MySqlPool) -> Self {
    Transactor::Pool {
      pool,
    }
  }

  /// Constructor
  pub fn for_connection(connection: &'e mut sqlx::MySqlConnection) -> Self {
    Transactor::Connection {
      connection,
    }
  }

  /// Constructor
  pub fn for_transaction(transaction: &'e mut Transaction<'t, MySql>) -> Self {
    Transactor::Transaction {
      transaction,
    }
  }

  /// Execute against the Transactor.
  pub async fn execute(
    self,
    query: Query<'_, MySql, MySqlArguments>
  ) -> Result<MySqlQueryResult, sqlx::Error> {
    match self {
      Transactor::Pool { pool } => {
        query.execute(pool).await
      },
      Transactor::Connection { connection } => {
        query.execute(connection).await
      },
      Transactor::Transaction { transaction } => {
        query.execute(&mut **transaction).await
      },
    }
  }
}
