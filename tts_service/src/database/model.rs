use diesel::prelude::*;
use crate::schema::sentences;
use anyhow::Result as AnyhowResult;
use crate::database::connector::DatabaseConnector;
use chrono::NaiveDateTime;

#[derive(Queryable)]
pub struct Sentence {
  pub id: i32,
  pub sentence: String,
  pub speaker: String,
  pub ip_address: String,
  pub created_at: NaiveDateTime,
}

#[derive(Insertable, Debug)]
#[table_name="sentences"]
pub struct NewSentence {
  pub sentence: String,
  pub speaker: String,
  pub ip_address: String,
}

impl NewSentence {

  pub fn insert(&self, db_connector: &DatabaseConnector) -> AnyhowResult<()> {
    let pooled_connection = db_connector.get_pooled_connection()?;
    let _size = diesel::insert_into(sentences::table)
        .values(self)
        .execute(&pooled_connection)?;
    Ok(())
  }
}
