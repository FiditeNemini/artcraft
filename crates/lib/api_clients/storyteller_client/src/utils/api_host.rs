
#[derive(Clone)]
pub enum ApiHost {
  Storyteller,
  FakeYou,
  Localhost { port: u32 },
}

impl ApiHost {
  pub fn to_api_hostname(&self) -> String {
    match self {
      ApiHost::Storyteller => "api.storyteller.ai".to_string(),
      ApiHost::FakeYou => "api.fakeyou.com".to_string(),
      ApiHost::Localhost { port } => format!("localhost:{}", port),
    }
  }
}
