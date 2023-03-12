
/// Redis cache keys likely need to be shared across microservice boundaries, hence being defined here.
/// Note that the caching system might mangle these keys further.
pub struct RedisCacheKeys {}

impl RedisCacheKeys {

  pub fn get_tts_model_endpoint(model_token: &str) -> String {
    format!("get_tts_model:{}", model_token)
  }
}
