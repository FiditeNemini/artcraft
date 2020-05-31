use anyhow::Result as AnyhowResult;
use chrono::{NaiveDateTime, DateTime, Utc};
use crate::database::connector::{DatabaseConnector, MysqlPooledConnection};
use crate::schema::sentences;
//use crate::schema::sentences::dsl::*;
use diesel::prelude::*;

#[derive(Queryable, Serialize, Debug)]
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

impl Sentence {

  pub fn load(db_connector: &DatabaseConnector, limit: i64) -> AnyhowResult<Vec<Sentence>> {
    let pooled_connection : MysqlPooledConnection = db_connector.get_pooled_connection()?;
    let results = sentences::dsl::sentences
        .limit(limit)
        .load::<Sentence>(&pooled_connection)?;
    Ok(results)
  }
}

