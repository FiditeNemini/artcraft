use crate::remote_file_manager::file_descriptor::FileDescriptor;
// TODO ASK BRANDON WHAT path should this be?
const MEDIA_FILE_DIRECTORY: &str = "/media";

pub struct MediaImagePngDescriptor;

impl FileDescriptor for MediaImagePngDescriptor {
    fn remote_directory_path(&self) -> &str {
        MEDIA_FILE_DIRECTORY
    }
    fn get_suffix(&self)->String {
        "png".to_string()
    }

    fn get_prefix(&self)->String {
        "image".to_string()
    }

    fn is_public(&self) -> bool {
        true
    }
}
