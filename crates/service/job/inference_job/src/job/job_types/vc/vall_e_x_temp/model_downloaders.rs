use crate::util::model_downloader::ModelDownloader;

// Core models

crate::impl_model_downloader!(
  VallExEncodec,
  "vall-e-x encodec model",
  "VALL_E_X_CLOUD_PATH_ENCODEC",
  "/dependencies/zero_shot_tts/vall-e-x_1.0/encodec_pytorch_model.bin",
  "VALL_E_X_FS_PATH_ENCODEC",
  "/tmp/downloads/vall_e_x/encodec_pytorch_model.bin"
);

crate::impl_model_downloader!(
  VallExModel,
  "vall-e-x model",
  "VALL_E_X_CLOUD_PATH_MODEL",
  "/dependencies/zero_shot_tts/vall-e-x_1.0/vallex-checkpoint.pt",
  "VALL_E_X_FS_PATH_MODEL",
  "/tmp/downloads/vall_e_x/vallex-checkpoint.pt"
);

// Whisper (Medium)

crate::impl_model_downloader!(
  VallExWhisperMediumFlax,
  "vall-e-x whisper medium flax_model.msgpack",
  "VALL_E_X_CLOUD_PATH_WM_FLAX",
  "/dependencies/zero_shot_tts/vall-e-x_1.0/whisper-medium/flax_model.msgpack ",
  "VALL_E_X_FS_PATH_WM_FLAX",
  "/tmp/downloads/vall_e_x/whisper-medium/flax_model.msgpack "
);

// TODO (remaining files)

// Whisper (Large)

// TODO (remaining files)

pub struct VallExDownloaders {
  pub encodec: VallExEncodec,
  pub model: VallExModel,
  pub whisper_medium_flax: VallExWhisperMediumFlax,
}

impl VallExDownloaders {
  pub fn build_all_from_env() -> Self {
    Self {
      encodec: VallExEncodec::from_env(),
      model: VallExModel::from_env(),
      whisper_medium_flax: VallExWhisperMediumFlax::from_env(),
    }
  }

  pub fn all_downloaders(&self) -> Vec<&dyn ModelDownloader> {
    vec![
      &self.encodec,
      &self.model,
      &self.whisper_medium_flax,
    ]
  }
}
