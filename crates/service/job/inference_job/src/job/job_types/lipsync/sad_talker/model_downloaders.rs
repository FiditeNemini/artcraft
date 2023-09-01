
#[macro_use]
use crate::util::model_downloader;

crate::impl_model_downloader!(
  SadTalkerModelFirstMapping,
  "sad talker model first mapping",
  "SAD_FIRST_MAPPING_BUCKET_PATH",
  "/animation_sadtalker/model/mapping_00109-model.pth.tar",
  "SAD_FIRST_MAPPING_FILESYSTEM_PATH",
  "/tmp/downloads/sadtalker/mapping_00109-model.pth.tar"
);

crate::impl_model_downloader!(
  SadTalkerModelSecondMapping,
  "sad talker model second mapping",
  "SAD_SECOND_MAPPING_BUCKET_PATH",
  "/animation_sadtalker/model/mapping_00229-model.pth.tar",
  "SAD_SECOND_MAPPING_FILESYSTEM_PATH",
  "/tmp/downloads/sadtalker/mapping_00229-model.pth.tar"
);


#[cfg(test)]
mod test {
  use std::path::Path;
  use crate::job::job_types::lipsync::sad_talker::model_downloaders::SadTalkerModelFirstMapping;
  use crate::util::model_downloader::ModelDownloader;

  #[test]
  fn test_downloader_model_first_mapping() {
    let model = SadTalkerModelFirstMapping::default();
    assert_eq!(model.get_model_name(), "sad talker model first mapping");
    assert_eq!(model.get_cloud_bucket_path(), "/animation_sadtalker/model/mapping_00109-model.pth.tar");
    assert_eq!(model.get_filesystem_path(), Path::new("/tmp/downloads/sadtalker/mapping_00109-model.pth.tar"));
  }
}
