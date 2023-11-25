#![forbid(unused_imports)]
#![forbid(unused_mut)]
#![forbid(unused_variables)]

use chrono::{DateTime, Utc};
use sqlx::MySqlPool;

use config::shared_constants::DEFAULT_MYSQL_QUERY_RESULT_PAGE_SIZE;
use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::users::UserToken;

use enums::by_table::model_weights::{
    weights_types::WeightsType,
    weights_category::WeightsCategory,
};

use crate::queries::model_weights::list_weights_by_user::RawWeightJoinUser;


#[derive(Serialize)]
pub struct WeightsPage {
    pub weights: Vec<RawWeightJoinUser>,
    pub sort_ascending: bool,

    pub first_id: Option<i64>,

    pub last_id: Option<i64>,
}

pub struct ListWeightsQueryBuilder {
    scope_creator_username: Option<String>,
    include_mod_deleted_results: bool,
    include_user_deleted_results: bool,
    sort_ascending: bool,
    weights_type:WeightsType,
    weights_category:WeightsCategory,
    offset: Option<u64>,
    limit: u16,
    cursor_is_reversed: bool,
}

impl ListWeightsQueryBuilder {
    pub fn new() -> Self {
        Self {
            scope_creator_username: None,
            include_mod_deleted_results: false,
            include_user_deleted_results: false,
            sort_ascending: false,
            weights_type:WeightsType,
            weights_category:WeightsCategory,
            offset: None,
            limit: DEFAULT_MYSQL_QUERY_RESULT_PAGE_SIZE,
            cursor_is_reversed: false,
        }
    }

    pub fn scope_creator_username(mut self, scope_creator_username: Option<&str>) -> Self {
        self.scope_creator_username = scope_creator_username.map(|u| u.to_string());
        self
    }


    pub fn include_mod_deleted_results(mut self, include_mod_deleted_results: bool) -> Self {
        self.include_mod_deleted_results = include_mod_deleted_results;
        self
    }

    pub fn include_user_deleted_results(mut self, include_user_deleted_results: bool) -> Self {
        self.include_user_deleted_results = include_user_deleted_results;
        self
    }

    pub fn sort_ascending(mut self, sort_ascending: bool) -> Self {
        self.sort_ascending = sort_ascending;
        self
    }

    pub fn weights_type(mut self,weights_type:WeightsType) -> Self {
        self.weights_type = weights_type;
        self
    }

    pub fn weights_category(mut self,weights_category:WeightsCategory) -> Self {
        self.weights_category = weights_category;
        self
    }

    pub fn offset(mut self, offset: Option<u64>) -> Self {
        self.offset = offset;
        self
    }

    pub fn limit(mut self, limit: u16) -> Self {
        self.limit = limit;
        self
    }

    pub fn cursor_is_reversed(mut self, cursor_is_reversed: bool) -> Self {
        self.cursor_is_reversed = cursor_is_reversed;
        self
    }

    async fn perform_internal_query(
        &self,
        mysql_pool: &MySqlPool
    ) -> AnyhowResult<Vec<RawWeightJoinUser>> {
        let query = self.build_query_string();
        let mut query = sqlx::query_as::<_, RawWeightJoinUser>(&query);

        // NB: The following bindings must match the order of the query builder !!

        if let Some(offset) = self.offset {
            query = query.bind(offset);
        }

        if let Some(username) = self.scope_creator_username.as_deref() {
            query = query.bind(username);
        }

        query = query.bind(self.limit);

        let mut results = query.fetch_all(mysql_pool)
            .await?;

        if self.cursor_is_reversed {
            results.reverse()
        }

        Ok(results)
    }


    pub async fn perform_query_for_page(
        &self,
        mysql_pool: &MySqlPool
    ) -> AnyhowResult<WeightsPage> {
        let weights = self.perform_internal_query(mysql_pool).await?;

        let first_id = weights.first()
            .map(|raw_result| raw_result.weight_id);

        let last_id = weights.last()
            .map(|raw_result| raw_result.weight_id);

        let weights = weights.into_iter().map(
            |v| {
                RawWeightJoinUser {
                    weights_token: v.token,
                    title: v.title,
                    creator_set_visibility: Visibility::from_str(&v.creator_set_visibility).unwrap_or(Visibility::Public),
                    ietf_language_tag: v.ietf_language_tag,
                    ietf_primary_language_subtag: v.ietf_primary_language_subtag,
                    creator_user_token: v.creator_user_token,
                    creator_username: v.creator_username,
                    creator_display_name: v.creator_display_name,
                    creator_email_gravatar_hash: v.creator_email_gravatar_hash,
                    created_at: v.created_at,
                    updated_at: v.updated_at,
                }
            })
            .collect::<Vec<RawWeightJoinUser>>();

        Ok(WeightsPage {
            weights,
            sort_ascending: self.sort_ascending,
            first_id,
            last_id,
        })
    }

    pub fn build_query_string(&self) -> String {
        let mut query = r#"
        SELECT
            model_weights.id as voice_id,
            model_weights.token as `token: tokens::tokens::model_weights::RawWeightJoinUserToken`,
            model_weights.title,
            model_weights.ietf_language_tag,
            model_weights.ietf_primary_language_subtag,

            users.token as `creator_user_token: tokens::tokens::users::UserToken`,
            users.username as creator_username,
            users.display_name as creator_display_name,
            users.email_gravatar_hash as creator_email_gravatar_hash,

            model_weights.creator_set_visibility,
            model_weights.created_at,
            model_weights.updated_at
        FROM model_weights
        JOIN users
            ON users.token = model_weights.maybe_creator_user_token
        "#.to_string();

        query.push_str(&self.build_predicates());
        query
    }

    pub fn build_predicates(&self) -> String {
        // NB: Reverse cursors require us to invert the sort direction.
        let mut sort_ascending = self.sort_ascending;

        let mut first_predicate_added = false;

        let mut query = "".to_string();

        if let Some(_offset) = self.offset {
            if !first_predicate_added {
                query.push_str(" WHERE");
                first_predicate_added = true;
            } else {
                query.push_str(" AND");
            }

            if sort_ascending {
                if self.cursor_is_reversed {
                    // NB: We're searching backwards.
                    query.push_str(" model_weights.id < ?");
                    sort_ascending = !sort_ascending;
                } else {
                    query.push_str(" model_weights.id > ?");
                }
            } else {
                if self.cursor_is_reversed {
                    // NB: We're searching backwards.
                    query.push_str(" model_weights.id > ?");
                    sort_ascending = !sort_ascending;
                } else {
                    query.push_str(" model_weights.id < ?");
                }
            }
        }

        if let Some(_username) = self.scope_creator_username.as_deref() {
            if !first_predicate_added {
                query.push_str(" WHERE users.username = ?");
                first_predicate_added = true;
            } else {
                query.push_str(" AND users.username = ?");
            }
        }

        if !self.include_user_hidden {
            if !first_predicate_added {
                query.push_str(" WHERE model_weights.creator_set_visibility = 'public'");
                first_predicate_added = true;
            } else {
                query.push_str(" AND model_weights.creator_set_visibility = 'public'");
            }
        }

        if !self.include_mod_deleted_results {
            if !first_predicate_added {
                query.push_str(" WHERE model_weights.mod_deleted_at IS NULL");
                first_predicate_added = true;
            } else {
                query.push_str(" AND model_weights.mod_deleted_at IS NULL");
            }
        }

        if !self.include_user_deleted_results {
            if !first_predicate_added {
                query.push_str(" WHERE model_weights.user_deleted_at IS NULL");
                first_predicate_added = true;
            } else {
                query.push_str(" AND model_weights.user_deleted_at IS NULL");
            }
        }

        if sort_ascending {
            query.push_str(" ORDER BY model_weights.id ASC");
        } else {
            query.push_str(" ORDER BY model_weights.id DESC");
        }

        query.push_str(" LIMIT ?");

        query
    }
}

#[derive(sqlx::FromRow)]
struct RawWeightJoinUser {
    weight_id: i64,
    token: RawWeightJoinUserToken,
    title: String,
    ietf_language_tag: String,
    ietf_primary_language_subtag: String,
    creator_user_token: UserToken,
    creator_username: String,
    creator_display_name: String,
    creator_email_gravatar_hash: String,
    creator_set_visibility: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[cfg(test)]
mod tests {
    use crate::queries::voice_designer::voices::list_voices_query_builder::ListWeightsQueryBuilder;

    #[test]
    fn predicates_without_scoping() {
        let query_builder = ListWeightsQueryBuilder::new();

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE model_weights.creator_set_visibility = 'public' \
      AND model_weights.mod_deleted_at IS NULL \
      AND model_weights.user_deleted_at IS NULL \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }

    #[test]
    fn predicates_scoped_to_user() {
        let query_builder = ListWeightsQueryBuilder::new()
            .scope_creator_username(Some("echelon"));

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE users.username = ? \
      AND model_weights.creator_set_visibility = 'public' \
      AND model_weights.mod_deleted_at IS NULL \
      AND model_weights.user_deleted_at IS NULL \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }

    #[test]
    fn predicates_including_user_hidden() {
        let query_builder = ListWeightsQueryBuilder::new()
            .include_user_hidden(true);

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE model_weights.mod_deleted_at IS NULL \
      AND model_weights.user_deleted_at IS NULL \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }

    #[test]
    fn predicates_including_mod_deleted() {
        let query_builder = ListWeightsQueryBuilder::new()
            .include_mod_deleted_results(true);

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE model_weights.creator_set_visibility = 'public' \
      AND model_weights.user_deleted_at IS NULL \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }

    #[test]
    fn predicates_including_user_deleted() {
        let query_builder = ListWeightsQueryBuilder::new()
            .include_user_deleted_results(true);

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE model_weights.creator_set_visibility = 'public' \
      AND model_weights.mod_deleted_at IS NULL \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }

    #[test]
    fn predicates_including_mod_deleted_and_user_deleted() {
        let query_builder = ListWeightsQueryBuilder::new()
            .include_mod_deleted_results(true)
            .include_user_deleted_results(true);

        assert_eq!(&query_builder.build_predicates(),
                   " WHERE model_weights.creator_set_visibility = 'public' \
      ORDER BY model_weights.id DESC \
      LIMIT ?");
    }
}