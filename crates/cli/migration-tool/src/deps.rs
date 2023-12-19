use sqlx::{MySql, Pool};

pub struct Deps {
  pub mysql_development : Pool<MySql>,
  pub mysql_production : Pool<MySql>,
}
