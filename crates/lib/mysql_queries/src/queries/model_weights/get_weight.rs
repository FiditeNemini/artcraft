use container_common::anyhow_result::AnyhowResult;
use sqlx::MySqlPool;
use enums::by_table::model_weights::{ weights_types::WeightsType, weights_category::WeightsCategory };
use log::warn;
use enums::common::visibility::Visibility;
use tokens::tokens::{ users::UserToken, model_weights::ModelWeightToken };


pub async fn get_weight_by_token(
    weight_token: &ModelWeightToken,
    can_see_deleted: bool,
    mysql_pool: &MySqlPool,
) -> AnyhowResult<Option<ZsVoice>> {
    let mut connection = mysql_pool.acquire().await?;
    get_voice_by_token_with_connection(
        weight_token,
        can_see_deleted,
        &mut connection
    ).await
}