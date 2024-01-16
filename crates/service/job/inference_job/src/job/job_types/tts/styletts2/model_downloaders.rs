use crate::util::model_downloader::ModelDownloader;

pub struct StyleTTS2Downloaders {
    // pub styletts2: StyleTTS2ModelMapping,
}

crate::impl_model_downloader!(
    StyleTTS2ModelMapping,
    "Vall-e-x Model Mapping",
    "VALL_E_X_MAPPING_BUCKET_PATH",
    "/dependencies/zero_shot_tts/vall-e-x_1.0/StyleTTS2-checkpoint.pt",
    "VALL_E_X_MAPPING_FILESYSTEM_PATH",
    "/tmp/downloads/zero_shot_tts/vall-e-x_1.0/StyleTTS2-checkpoint.pt"
);

crate::impl_model_downloader!(
    WhisperLargeModelMapping,
    "whisper Large Model Mapping",
    "WHISPER_LARGE_MAPPING_BUCKET_PATH",
    "/dependencies/zero_shot_tts/vall-e-x_1.0/whisper-large/model.safetensors",
    "WHISPER_LARGE_MAPPING_FILESYSTEM_PATH",
    "/tmp/downloads/zero_shot_tts/vall-e-x_1.0/whisper-large/model.safetensors"
);

crate::impl_model_downloader!(
    WhisperMediumModelMapping,
    "whisper Medium Model Mapping",
    "WHISPER_MEDIUM_TENSOR_BUCKET_PATH",
    "/dependencies/zero_shot_tts/vall-e-x_1.0/whisper/medium.pt",
    "WHISPER_MEDIUM_TENSOR_FILESYSTEM_PATH",
    "/tmp/downloads/zero_shot_tts/vall-e-x_1.0/whisper/medium.pt"
);

crate::impl_model_downloader!(
    VocosEncodecModelMapping,
    "Vocos Encodec Model Mapping",
    "VOCOS_ENCODEC_TENSOR_BUCKET_PATH",
    "/dependencies/zero_shot_tts/vall-e-x_1.0/vocos-encodec/encodec_pytorch_model.bin",
    "VOCOS_ENCODEC_TENSOR_FILESYSTEM_PATH",
    "/tmp/downloads/zero_shot_tts/vall-e-x_1.0/vocos-encodec/encodec_pytorch_model.bin"
);

crate::impl_model_downloader!(
    VocosEncodecConfigMapping,
    "Vocos Config Mapping",
    "VOCOS_ENCODEC_CONFIG_BUCKET_PATH",
    "/dependencies/zero_shot_tts/vall-e-x_1.0/vocos-encodec/config.yaml",
    "VOCOS_ENCODEC_CONFIG_FILESYSTEM_PATH",
    "/tmp/downloads/zero_shot_tts/vall-e-x_1.0/vocos-encodec/config.yaml"
);

impl StyleTTS2Downloaders {
    // TODO(KS): All checkpoints are in the container, so we don't need to download them here.
    // Maybe they should be here instead
    pub fn build_all_from_env() -> Self {
        Self {
        }
    }

    pub fn all_downloaders(&self) -> Vec<&dyn ModelDownloader> {
        vec![]
    }
}

mod test {
    // use std::path::Path;

    // use crate::job::job_types::lipsync::sad_talker::model_downloaders::{SadTalkerModelFirstMapping, SadTalkerModelSecondMapping};
    // use crate::util::model_downloader::ModelDownloader;

    // #[test]
    // fn test_downloader_model_first_mapping() {
    //   let model = SadTalkerModelFirstMapping::default();
    //   assert_eq!(model.get_model_name(), "sad talker model first mapping");
    //   assert_eq!(model.get_cloud_bucket_path(), "/animation_sadtalker/model/mapping_00109-model.pth.tar");
    //   assert_eq!(model.get_filesystem_path(), Path::new("/tmp/downloads/sadtalker/mapping_00109-model.pth.tar"));
    // }

    // #[test]
    // fn test_downloader_model_second_mapping() {
    //   let model = SadTalkerModelSecondMapping::default();
    //   assert_eq!(model.get_model_name(), "sad talker model second mapping");
    //   assert_eq!(model.get_cloud_bucket_path(), "/animation_sadtalker/model/mapping_00229-model.pth.tar");
    //   assert_eq!(model.get_filesystem_path(), Path::new("/tmp/downloads/sadtalker/mapping_00229-model.pth.tar"));
    // }

}
