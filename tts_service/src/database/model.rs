use anyhow::Result as AnyhowResult;
use chrono::NaiveDateTime;
use crate::database::connector::{DatabaseConnector, MysqlPooledConnection};
use crate::schema::sentences;
//use crate::schema::sentences::dsl::*;
use diesel::prelude::*;
use diesel::expression::dsl::count_star;

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

  /// Get a count of all sentence records.
  pub fn count(db_connector: &DatabaseConnector) -> AnyhowResult<i64> {
    let pooled_connection : MysqlPooledConnection = db_connector.get_pooled_connection()?;
    let count : i64 = sentences::dsl::sentences
        .select(count_star())
        .first(&*pooled_connection)?;
    Ok(count)
  }

  /// Load sentence records
  pub fn load(db_connector: &DatabaseConnector, limit: i64, offset: i64, sort_ascending: bool) -> AnyhowResult<Vec<Sentence>> {
    let pooled_connection : MysqlPooledConnection = db_connector.get_pooled_connection()?;

    let query = sentences::dsl::sentences
        .limit(limit)
        .offset(offset)
        .into_boxed();

    let query = if sort_ascending {
      query.order(sentences::dsl::id.asc())
    } else {
      query.order(sentences::dsl::id.desc())
    };

    let results = query.load::<Sentence>(&pooled_connection)?;

    Ok(results)
  }
}

