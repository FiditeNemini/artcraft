use anyhow::anyhow;
use crate::AnyhowResult;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Config that defines any extra "reward" endpoints.
#[derive(Deserialize, Debug, Clone)]
pub struct BonusEndpoints {
  pub bonus_endpoints: Vec<BonusEndpoint>,
}

#[derive(Deserialize, Debug, Clone)]
pub struct BonusEndpoint {
  /// The endpoint to access
  pub http_endpoint: String,

  /// List of voice slugs
  pub voices: Vec<String>,
}

/// Mapping of all the voices.
#[derive(Clone)]
pub struct BonusEndpointMappings {
  pub url_slug_to_voices: HashMap<String, Vec<String>>
}

impl BonusEndpoints {
  pub fn load_from_file(filename: &str) -> AnyhowResult<BonusEndpoints> {
    let contents = fs::read_to_string(filename)?;
    let bonus_endpoints : BonusEndpoints = toml::from_str(&contents)?;
    Ok(bonus_endpoints)
  }

  pub fn to_mappings(&self) -> AnyhowResult<BonusEndpointMappings> {
    let mut mappings = HashMap::new();

    for endpoint in self.bonus_endpoints.iter() {
      if mappings.contains_key(&endpoint.http_endpoint) {
        return Err(anyhow!("Endpoint already present in mappings: {}", &endpoint.http_endpoint));
      }
      mappings.insert(endpoint.http_endpoint.to_string(), endpoint.voices.clone());
    }

    Ok(BonusEndpointMappings {
      url_slug_to_voices: mappings,
    })
  }
}
