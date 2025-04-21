use std::fs::read_to_string;
use errors::AnyhowResult;
use openai_sora_client::credentials::SoraCredentials;
use crate::state::app_dir::AppDataRoot;

pub fn read_sora_credentials_from_disk(app_data_root: &AppDataRoot) -> AnyhowResult<SoraCredentials> {
  let cookie_file = app_data_root.get_sora_cookie_file_path();
  let bearer_file = app_data_root.get_sora_bearer_token_file_path();
  let sentinel_file = app_data_root.get_sora_sentinel_file_path();

  let cookie = read_to_string(cookie_file)?
      .trim()
      .to_string();

  let bearer = read_to_string(bearer_file)?
      .trim()
      .to_string();

  if sentinel_file.exists() && sentinel_file.is_file() {
    let sentinel = read_to_string(sentinel_file)?
        .trim()
        .to_string();

    return Ok(SoraCredentials {
      bearer_token: bearer,
      cookie,
      sentinel: Some(sentinel),
    });
  }

  Ok(SoraCredentials {
    bearer_token: bearer,
    cookie,
    sentinel: None,
  })
}
