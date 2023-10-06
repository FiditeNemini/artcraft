use log::info;
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};
use hashing::bcrypt::bcrypt_password_hash::bcrypt_password_hash;
use hashing::md5::email_to_gravatar_hash::email_to_gravatar_hash;
use mysql_queries::queries::users::user::create_account::{create_account, CreateAccountArgs};
use mysql_queries::queries::users::user::get_user_token_by_username::get_user_token_by_username;
use mysql_queries::queries::voice_designer::datasets::create_dataset::{create_dataset, CreateDatasetArgs};
use mysql_queries::queries::voice_designer::voices::create_voice::{create_voice, CreateVoiceArgs};

use crate::seeding::users::HANASHI_USERNAME;

pub async fn seed_zero_shot_tts(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
  info!("Seeding zero shot TTS...");

  let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
    None => { return Err(anyhow!("could not find user hanashi")) }
    Some(token) => token,
  };

  info!("Creating dataset...");

  let dataset_token = create_dataset(CreateDatasetArgs {
    dataset_title: "Goku Dataset",
    maybe_creator_user_token: Some(user_token.as_str()),
    creator_ip_address: "127.0.0.1",
    creator_set_visibility: &Default::default(),
    maybe_mod_user_token: None,
    mysql_pool,
  }).await?;

  info!("Creating voice...");

  let voice_token = create_voice(CreateVoiceArgs {
    dataset_token: &dataset_token,
    model_category: "vc",
    model_type: "vall-e-x",
    model_version: 0,
    model_encoding_type: "encodec",
    voice_title: "Goku Voice",
    bucket_hash: "asdf",
    maybe_creator_user_token: Some(&user_token),
    creator_ip_address: "127.0.0.1",
    creator_set_visibility: &Default::default(),
    mysql_pool,
  }).await?;

  Ok(())
}

async fn seed_dataset(
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
