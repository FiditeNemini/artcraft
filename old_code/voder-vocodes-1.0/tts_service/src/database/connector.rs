use anyhow::Result as AnyhowResult;
use diesel::mysql::MysqlConnection;
use diesel::r2d2::ConnectionManager;
use diesel::r2d2::Pool;
use diesel::r2d2::PooledConnection;

pub type MysqlPooledConnection = PooledConnection<ConnectionManager<MysqlConnection>>;

pub struct DatabaseConnector {
  connection_string: String,
  connection_pool: Option<Pool<ConnectionManager<MysqlConnection>>>,
}

impl DatabaseConnector {

  pub fn create(connection_string: &str) -> Self {
    Self {
      connection_string: connection_string.to_string(),
      connection_pool: None,
    }
  }

  pub fn connect(&mut self) -> AnyhowResult<()> {
    let manager = ConnectionManager::<MysqlConnection>::new(&self.connection_string);
    // TODO: Configure thread pool.
    let pool = Pool::builder()
        .build(manager)?;
    self.connection_pool = Some(pool);
    Ok(())
  }

  pub fn get_pooled_connection(&self) -> AnyhowResult<MysqlPooledConnection> {
    match &self.connection_pool {
      None => bail!("No connection established."),
      Some(pool) => Ok(pool.get()?),
    }
  }
}
