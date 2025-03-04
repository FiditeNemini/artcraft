use serde::Serialize;

#[derive(Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum NotificationEvent<'a> {
  ModelDownloadStarted {
    model_name: &'a str, 
  },
  ModelDownloadComplete {
    model_name: &'a str,
  }
}
