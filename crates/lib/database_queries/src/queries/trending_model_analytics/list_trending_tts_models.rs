use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;
use enums::by_table::trending_model_analytics::model_type::ModelType;
use enums::by_table::trending_model_analytics::window_name::WindowName;
use errors::AnyhowResult;
use tokens::tokens::tts_models::TtsModelToken;

pub struct TrendingModels {
  pub models: Vec<TrendingModel>,
}

pub struct TrendingModel {
  pub model_token: TtsModelToken,

  // NB: "en", "es", etc. not "en-US", "es-419", etc.
  pub ietf_primary_language_subtag: String,

  // Time window
  pub window_name: WindowName,

  // Count of uses within the window.
  pub numeric_value: u64,
}

// TODO(bt,2023-01-17): This query is massive, so is not type checked :(

pub async fn list_trending_tts_models_with_pool(
  mysql_pool: &MySqlPool,
) -> AnyhowResult<TrendingModels> {
  let mut mysql_connection = mysql_pool.acquire().await?;
  list_trending_tts_models(&mut mysql_connection).await
}

pub async fn list_trending_tts_models(
  mysql_connection: &mut PoolConnection<MySql>,
) -> AnyhowResult<TrendingModels> {
  let query_parts = vec![
    // English
    make_subquery(ModelType::Tts, WindowName::AllTime, "en"),
    make_subquery(ModelType::Tts, WindowName::Last3Hours, "en"),
    make_subquery(ModelType::Tts, WindowName::Last3Days, "en"),

    // Spanish
    make_subquery(ModelType::Tts, WindowName::AllTime, "es"),
    make_subquery(ModelType::Tts, WindowName::Last3Hours, "es"),
    make_subquery(ModelType::Tts, WindowName::Last3Days, "es"),

    // Italian
    make_subquery(ModelType::Tts, WindowName::AllTime, "it"),
    make_subquery(ModelType::Tts, WindowName::Last3Hours, "it"),
    make_subquery(ModelType::Tts, WindowName::Last3Days, "it"),

    // French
    make_subquery(ModelType::Tts, WindowName::AllTime, "fr"),
    make_subquery(ModelType::Tts, WindowName::Last3Hours, "fr"),
    make_subquery(ModelType::Tts, WindowName::Last3Days, "fr"),

    // German
    make_subquery(ModelType::Tts, WindowName::AllTime, "de"),
    make_subquery(ModelType::Tts, WindowName::Last3Hours, "de"),
    make_subquery(ModelType::Tts, WindowName::Last3Days, "de"),
  ];

  let query = query_parts.join(" UNION ");
  let mut query = sqlx::query_as::<_, RawTrendingModel>(&query);

  let results = query.fetch_all(mysql_connection).await?;

  let results = results.into_iter()
      .map(|model| TrendingModel {
        model_token: TtsModelToken::new(model.model_token),
        ietf_primary_language_subtag: model.ietf_primary_language_subtag,
        window_name: WindowName::from_str(&model.window_name).unwrap_or(WindowName::AllTime), // TODO: Fail properly
        numeric_value: model.numeric_value as u64,
      })
      .collect::<Vec<TrendingModel>>();

  Ok(TrendingModels {
    models: results,
  })
}

// Build queries meant to be UNION-d together.
pub fn make_subquery(model_type: ModelType, window_name: WindowName, ietf_primary_language_subtag: &str) -> String {
  format!(r#"
(
  SELECT
    m.token as model_token,
    m.ietf_primary_language_subtag,
    t.window_name,
    t.numeric_value

  FROM trending_model_analytics AS t
  JOIN tts_models AS m
  ON m.token = t.model_token

  WHERE
    t.model_type = "{}"
    AND t.window_name = "{}"
    AND m.ietf_primary_language_subtag = "{}"

  ORDER BY numeric_value DESC
  LIMIT 10
)
  "#,
          model_type,
          window_name,
          ietf_primary_language_subtag)
}

#[derive(sqlx::FromRow)]
struct RawTrendingModel {
  pub model_token: String,
  pub ietf_primary_language_subtag: String,
  pub window_name: String,
  pub numeric_value: i64,
}