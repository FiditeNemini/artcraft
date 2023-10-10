use log::info;
use sqlx::{MySql, Pool};

use errors::{anyhow, AnyhowResult};
use mysql_queries::queries::users::user::get_user_token_by_username::get_user_token_by_username;
use mysql_queries::queries::voice_designer::datasets::create_dataset::{create_dataset, CreateDatasetArgs};
use mysql_queries::queries::voice_designer::voices::create_voice::{create_voice, CreateVoiceArgs};
use tokens::tokens::users::UserToken;

use crate::seeding::users::HANASHI_USERNAME;

pub async fn seed_zero_shot_tts(mysql_pool: &Pool<MySql>) -> AnyhowResult<()> {
  info!("Seeding zero shot TTS...");

  let user_token = match get_user_token_by_username(HANASHI_USERNAME, mysql_pool).await? {
    None => { return Err(anyhow!("could not find user hanashi")) }
    Some(token) => token,
  };

  let records = [
    // NB: The bucket hashes here are already uploaded to the development Google Cloud Storage
    // bucket and should be usable if you have the development secrets on your machine.
    ("Alice", "qtqaprnd5shtybve4fqpvcfp50yjw238fbgj92z1521c50xqdxy1akkhkw7tesj0", &user_token),
    ("Biden", "n945w0xsq15xrh16hc147a5mc1a91gwh886e14qqzte1gr9z9q3yawjfvanp4fmg", &user_token),
    ("Goku", "cnnv05yjst2m737dpmxazgfpksjf4y7cxxern2ph7gddgnkh2bw1ephg5mhjbz14", &user_token),
    ("Hilary", "7wav68ba2yy86491jk36cgk36tkmzesr452dgfs28wchkrr03bd0h3e6c1bbz9eg", &user_token),
    ("Obama", "z3gy4v56sgtfrxfrpvaj7v74sqc67rcqs89jb884b00zfdm9vmkf1w2fsnta0gwp", &user_token),
    ("Trump", "qcy7pv3rph0ntkqnpz5cfg9ksyh7kkz53v1wbr2ckvt8znvhxqn7ca5mz7wzm3q5", &user_token),
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
