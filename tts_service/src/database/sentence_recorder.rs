use crate::database::connector::DatabaseConnector;
use crate::database::model::NewSentence;

pub struct SentenceRecorder {
  database_connector: Option<DatabaseConnector>,
}

impl SentenceRecorder {
  pub fn new(database_connector: DatabaseConnector) -> Self {
    Self {
      database_connector: Some(database_connector),
    }
  }

  pub fn no_op_recoder() -> Self {
    Self {
      database_connector: None,
    }

  }

  pub fn record_sentence(&self, speaker_slug: &str, text: &str, ip_address: &str) {
    if let Some(ref database_connector) = self.database_connector {
      let sentence_record = NewSentence {
        sentence: text.to_string(),
        speaker: speaker_slug.to_string(),
        ip_address: ip_address.to_string(),
      };

      match sentence_record.insert(&database_connector) {
        Err(e) => error!("Could not insert sentence record for: {:?}, because: {:?}",
          sentence_record, e),
        Ok(_) => {},
      }
    }
  }
}