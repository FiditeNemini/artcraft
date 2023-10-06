use log::{info, warn};
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};
use hashing::bcrypt::bcrypt_password_hash::bcrypt_password_hash;
use hashing::md5::email_to_gravatar_hash::email_to_gravatar_hash;
use mysql_queries::queries::users::user::create_account::{create_account, CreateAccountArgs};

pub async fn seed_user_accounts(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
  info!("Seeding user accounts...");

  let users = [
    ("admin", "admin@storyteller.ai", "password"),
    ("hanashi", "admin@storyteller.ai", "password"),
    ("test", "admin@storyteller.ai", "password"),
  ];

  for (username, email, password) in users {
    let result = seed_user(username, email, password, &mysql_pool).await;
    match result {
      Ok(_) => info!("Seeded {}", username),
      Err(err) => warn!("Could not seed user {} : {:?}", username, err),
    }
  }

  Ok(())
}

async fn seed_user(
  username: &str,
  email_address: &str,
  password: &str,
  mysql_pool: &Pool<MySql>,
) -> AnyhowResult<()> {
  info!("Seeding user {} ...", username);

  let display_name = username.clone();
  let username = username.to_lowercase();
  let email_gravatar_hash = email_to_gravatar_hash(&email_address);
  let password_hash = bcrypt_password_hash(password)?;

  create_account(mysql_pool, CreateAccountArgs {
    username: &username,
    display_name,
    email_address,
    email_gravatar_hash: &email_gravatar_hash,
    password_hash: &password_hash,
    ip_address: "127.0.0.1",
  }).await.map_err(|err| anyhow!("err: {:?}", err))?;

  Ok(())
}
