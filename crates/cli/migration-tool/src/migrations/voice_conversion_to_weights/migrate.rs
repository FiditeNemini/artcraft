use std::thread;
use std::time::Duration;
use errors::AnyhowResult;
use mysql_queries::queries::voice_conversion::models::list_whole_voice_conversion_models_using_cursor::list_whole_voice_conversion_models_using_cursor;
use crate::deps::Deps;

const PAGE_SIZE: u64 = 10;

pub async fn migrate_voice_conversion_to_weights(deps: &Deps) -> AnyhowResult<()> {

  let mut cursor = 0;

  loop {

    let results
        = list_whole_voice_conversion_models_using_cursor(&deps.mysql_production, PAGE_SIZE, cursor).await?;

    if results.is_empty() {
      break;
    }

    for result in results.iter() {
      println!("result: {:?}", result);
    }

    if let Some(last_id) = results.last().map(|result| result.id) {
      cursor = last_id as u64;
    }

    thread::sleep(Duration::from_secs(2));
  }

  Ok(())
}
