use log::info;
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};
use mysql_queries::queries::users::user::get_user_token_by_username::get_user_token_by_username;
use mysql_queries::queries::voice_designer::datasets::create_dataset::{create_dataset, CreateDatasetArgs};
use mysql_queries::queries::voice_designer::voices::create_voice::{create_voice, CreateVoiceArgs};
use tokens::users::user::UserToken;

use crate::seeding::users::HANASHI_USERNAME;

pub async fn seed_zero_shot_tts(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
  info!("Seeding zero shot TTS...");

  let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
    None => { return Err(anyhow!("could not find user hanashi")) }
    Some(token) => token,
  };

  let records = [
    ("Goku", "todo", &user_token),
    ("David Attenborough", "todo", &user_token),
    ("Ash Ketchum", "todo", &user_token),
  ];

  for (voice_name, bucket_hash, user_token) in records {
    create_voice_records(voice_name, user_token, mysql_pool).await?;
  }

  Ok(())
}

async fn create_voice_records(
  voice_name: &str,
  creator_user_token: &UserToken,
  mysql_pool: &Pool<MySql>,
) -> AnyhowResult<()> {
  info!("Creating voice records for voice {} ...", voice_name);

  let dataset_title = format!("{} dataset", voice_name);

  info!("Creating dataset...");

  let dataset_token = create_dataset(CreateDatasetArgs {
    dataset_title: &dataset_title,
    maybe_creator_user_token: Some(creator_user_token.as_str()),
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
    voice_title: &voice_name,
    bucket_hash: "asdf", // TODO
    maybe_creator_user_token: Some(&creator_user_token),
    creator_ip_address: "127.0.0.1",
    creator_set_visibility: &Default::default(),
    mysql_pool,
  }).await?;

  Ok(())
}
