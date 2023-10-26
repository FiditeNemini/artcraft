use anyhow::anyhow;
use chrono::{DateTime, Utc};
use log::{info, warn};
use sqlx::{MySql, MySqlPool};
use sqlx::pool::PoolConnection;

use enums::common::visibility::Visibility;
use errors::AnyhowResult;
use tokens::tokens::users::UserToken;
use tokens::tokens::zs_voices::ZsVoiceToken;

// FIXME: This is the old style of query scoping and shouldn't be copied.

#[derive(Serialize)]
pub struct VoiceRecordForList {
    pub voice_token: ZsVoiceToken,
    pub title: String,
    pub creator_set_visibility: Visibility,
    pub ietf_language_tag: String,
    pub ietf_primary_language_subtag: String,
    pub creator_user_token: UserToken,
    pub creator_username: String,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn list_voices_by_user_token(
    mysql_pool: &MySqlPool,
    creator_username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<VoiceRecordForList>> {
    let mut connection = mysql_pool.acquire().await?;
    list_voices_with_connection(&mut connection, creator_username, can_see_deleted).await
}

pub async fn list_voices_with_connection(
    mysql_connection: &mut PoolConnection<MySql>,
    creator_username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<VoiceRecordForList>> {

    let maybe_voices = list_voices_by_creator_username(mysql_connection, creator_username, can_see_deleted)
                .await;

    let voices : Vec<InternalRawVoiceRecordForList> = match maybe_voices {
        Ok(voices) => voices,
        Err(err) => {
            match err {
                RowNotFound => {
                    return Ok(Vec::new());
                },
                _ => {
                    warn!("voice list query error: {:?}", err);
                    return Err(anyhow!("voice list query error"));
                }
            }
        }
    };

    Ok(voices.into_iter()
        .map(|voice| {
            VoiceRecordForList{
                voice_token: voice.token,
                title: voice.title,
                creator_set_visibility: voice.creator_set_visibility,
                ietf_language_tag: voice.ietf_language_tag,
                ietf_primary_language_subtag: voice.ietf_primary_language_subtag,
                creator_user_token: voice.creator_user_token,
                creator_username: voice.creator_username,

                created_at: voice.created_at,
                updated_at: voice.updated_at,
            }
        })
        .filter(|voice| {
           creator_username == voice.creator_username || voice.creator_set_visibility == Visibility::Public || can_see_deleted
        })
        .collect::<Vec<VoiceRecordForList>>())
}


async fn list_voices_by_creator_username(
    mysql_connection: &mut PoolConnection<MySql>,
    creator_username: &str,
    can_see_deleted: bool,
) -> AnyhowResult<Vec<InternalRawVoiceRecordForList>> {
    // TODO: There has to be a better way.
    //  Sqlx doesn't like anything except string literals.
    let maybe_voices = if !can_see_deleted {
        info!("listing voices for user;");
        sqlx::query_as!(
      InternalRawVoiceRecordForList,
        r#"
        SELECT
            zv.token as `token: tokens::tokens::zs_voices::ZsVoiceToken`,
            zv.title,
            zv.ietf_language_tag,
            zv.ietf_primary_language_subtag,
            users.token as `creator_user_token: tokens::tokens::users::UserToken`,
            users.username as creator_username,
            zv.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zv.created_at,
            zv.updated_at
        FROM zs_voices as zv
        JOIN users
            ON users.token = zv.maybe_creator_user_token
        WHERE
            users.username = ?
            AND zv.user_deleted_at IS NULL
            AND zv.mod_deleted_at IS NULL
        "#,
      creator_username)
            .fetch_all(mysql_connection)
            .await?
    } else {
        info!("listing voices for user");
        sqlx::query_as!(
      InternalRawVoiceRecordForList
            ,
        r#"
        SELECT
            zv.token as `token: tokens::tokens::zs_voices::ZsVoiceToken`,
            zv.title,
            zv.ietf_language_tag,
            zv.ietf_primary_language_subtag,
            users.token as `creator_user_token: tokens::tokens::users::UserToken`,
            users.username as creator_username,
            zv.creator_set_visibility as `creator_set_visibility: enums::common::visibility::Visibility`,
            zv.created_at,
            zv.updated_at
        FROM zs_voices as zv
        JOIN users
            ON users.token = zv.maybe_creator_user_token
        WHERE
            users.username = ?
        "#,
      creator_username)
            .fetch_all(mysql_connection)
            .await?
    };

    Ok(maybe_voices)
}

struct InternalRawVoiceRecordForList {
    token: ZsVoiceToken,
    title: String,
    ietf_language_tag: String,
    ietf_primary_language_subtag: String,
    creator_user_token: UserToken,
    creator_username: String,
    creator_set_visibility: Visibility,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}
