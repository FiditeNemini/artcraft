use crate::remote_file_manager::remote_cloud_bucket_details::RemoteCloudBucketDetails;

#[derive(Debug, Clone)]
pub struct FileMetaData {
    pub file_size_bytes: u64,
    pub sha256_checksum: String,
    pub mimetype: String,
    pub bucket_details: Option<RemoteCloudBucketDetails>
}
