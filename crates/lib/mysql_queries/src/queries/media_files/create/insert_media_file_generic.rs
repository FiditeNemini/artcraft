use anyhow::anyhow;
use enums::common::visibility::Visibility;
use sqlx;
use sqlx::MySqlPool;

use enums::by_table::generic_synthetic_ids::id_category::IdCategory;
use enums::by_table::media_files::media_file_origin_category::{MediaFileOriginCategory, self};
use enums::by_table::media_files::media_file_origin_model_type::MediaFileOriginModelType;
use enums::by_table::media_files::media_file_origin_product_category::MediaFileOriginProductCategory;
use enums::by_table::media_files::media_file_type::MediaFileType;

use errors::AnyhowResult;
use tokens::tokens::anonymous_visitor_tracking::AnonymousVisitorTrackingToken;
use tokens::tokens::media_files::MediaFileToken;
use tokens::tokens::model_weights::ModelWeightToken;
use tokens::tokens::users::UserToken;

use crate::queries::generic_inference::job::list_available_generic_inference_jobs::AvailableInferenceJob;
use crate::queries::generic_synthetic_ids::transactional_increment_generic_synthetic_id::transactional_increment_generic_synthetic_id;
use crate::queries::media_files::create::insert_media_file_from_file_upload::UploadType;
// thought about this it seems like this can be a bit more geneneric instead of having this we can ...
pub struct InsertArgs<'a> {
    pub pool: &'a MySqlPool,
    pub job: &'a AvailableInferenceJob,

    pub media_type: MediaFileType,

    // Origin and categorization
    pub origin_category: MediaFileOriginCategory,
    pub origin_product_category: MediaFileOriginProductCategory,
    pub maybe_origin_model_type: Option<MediaFileOriginModelType>,
    pub maybe_origin_model_token: Option<ModelWeightToken>,
    pub maybe_origin_filename: Option<String>,

    // Generation flags and media details
    pub is_batch_generated: bool,  // Assuming you set this in your application logic

    pub maybe_mime_type: Option<&'a str>,
    
    pub file_size_bytes: u64,
    pub maybe_duration_millis: Option<u64>,
    pub maybe_audio_encoding: Option<&'a str>,
    pub maybe_video_encoding: Option<&'a str>,
    pub maybe_frame_width: Option<u32>,
    pub maybe_frame_height: Option<u32>,
    pub checksum_sha2: &'a str,

    // Storage details
    pub public_bucket_directory_hash: &'a str,
    pub maybe_public_bucket_prefix: Option<&'a str>,
    pub maybe_public_bucket_extension: Option<&'a str>,
    pub extra_file_modification_info: Option<&'a str>,  // Assuming TEXT type can be represented by &str

    // Creator information
    pub maybe_creator_user_token: Option<&'a UserToken>,
    pub maybe_creator_anonymous_visitor_token: Option<&'a AnonymousVisitorTrackingToken>,

    pub creator_ip_address: &'a str,
    pub creator_set_visibility: Visibility,

    pub maybe_creator_file_synthetic_id_category: IdCategory,
    pub maybe_creator_category_synthetic_id_category: IdCategory,

    // Modification and generation info
    pub maybe_mod_user_token: Option<&'a UserToken>,
    pub is_generated_on_prem: bool,
    pub generated_by_worker: Option<&'a str>,
    pub generated_by_cluster: Option<&'a str>,
}

pub async fn insert_media_file_generic(
    args: InsertArgs<'_>
) -> AnyhowResult<(MediaFileToken, u64)>
{
    let result_token = MediaFileToken::generate();

    let mut maybe_creator_file_synthetic_id : Option<u64> = None;
    let mut maybe_creator_category_synthetic_id : Option<u64> = None;

    let mut transaction = args.pool.begin().await?;
    
    // create a user token
    if let Some(creator_user_token) = args.job.maybe_creator_user_token.as_deref() {
        let user_token = UserToken::new_from_str(creator_user_token);
        
        let next_media_file_id = transactional_increment_generic_synthetic_id(
            &user_token,
            args.maybe_creator_file_synthetic_id_category,
            &mut transaction
        ).await?;

        let category_id = transactional_increment_generic_synthetic_id(
            &user_token,
            args.maybe_creator_category_synthetic_id_category,
            &mut transaction
        ).await?;

        maybe_creator_file_synthetic_id = Some(next_media_file_id);
        maybe_creator_category_synthetic_id = Some(category_id);
    }

    let query_result = sqlx::query!(
        r#"
        INSERT INTO media_files
        SET
            token = ?,
            media_type = ?,

            origin_category = ?, 
            origin_product_category = ?, 
            maybe_origin_model_type = ?, 
            maybe_origin_model_token = ?, 
            maybe_origin_filename = ?,

            is_batch_generated = ?, 

            maybe_mime_type = ?,
            file_size_bytes = ?,
            maybe_duration_millis = ?,
            maybe_audio_encoding = ?, 
            maybe_video_encoding = ?, 
            maybe_frame_width = ?, 
            maybe_frame_height = ?, 
            checksum_sha2 = ?,

            public_bucket_directory_hash = ?, 
            maybe_public_bucket_prefix = ?, 
            maybe_public_bucket_extension = ?, 
            extra_file_modification_info = ?, 

            maybe_creator_user_token = ?, 
            maybe_creator_anonymous_visitor_token = ?, 

            creator_ip_address = ?, 
            creator_set_visibility = ?, 

            maybe_creator_file_synthetic_id = ?, 
            maybe_creator_category_synthetic_id = ?,

            maybe_mod_user_token = ?, 
            is_generated_on_prem = ?, 
            generated_by_worker = ?, 
            generated_by_cluster = ?
        "#,
        result_token,
        args.media_type.to_str(),

        args.origin_category.to_str(),
        args.origin_product_category.to_str(),
        args.maybe_origin_model_type.map(|e| e.to_str()),
        args.maybe_origin_model_token.map(|e| e.to_string()),
        args.maybe_origin_filename,

        args.is_batch_generated,

        args.maybe_mime_type,
        args.file_size_bytes, 
        args.maybe_duration_millis,
        args.maybe_audio_encoding,
        args.maybe_video_encoding,
        args.maybe_frame_width, 
        args.maybe_frame_height, 
        args.checksum_sha2,

        args.public_bucket_directory_hash,
        args.maybe_public_bucket_prefix,
        args.maybe_public_bucket_extension,
        args.extra_file_modification_info,

        args.maybe_creator_user_token.map(|e| e.to_string()),
        args.maybe_creator_anonymous_visitor_token.map(|e| e.to_string()),

        args.creator_ip_address,
        args.creator_set_visibility.to_str(),

        maybe_creator_file_synthetic_id,
        maybe_creator_category_synthetic_id,

        args.maybe_mod_user_token,
        args.is_generated_on_prem,
        args.generated_by_worker,
        args.generated_by_cluster
    ).execute(&mut *transaction).await;

    let record_id = match query_result {
        Ok(res) => {
            res.last_insert_id()
        },
        Err(err) => {
            // TODO: handle better
            //transaction.rollback().await?;
            return Err(anyhow!("Mysql error: {:?}", err));
        }
    };

    transaction.commit().await?;
    Ok((result_token, record_id))
}