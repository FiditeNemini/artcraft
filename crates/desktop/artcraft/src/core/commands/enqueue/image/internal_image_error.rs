use base64::DecodeError;
use errors::AnyhowError;
use fal_client::error::fal_error_plus::FalErrorPlus;
use openai_sora_client::sora_error::SoraError;
use storyteller_client::error::api_error::ApiError;

#[derive(Debug)]
pub enum InternalImageError {
  NoModelSpecified,
  NeedsFalApiKey,
  NeedsSoraCredentials,
  FalError(FalErrorPlus),
  SoraError(SoraError),
  AnyhowError(AnyhowError),
  StorytellerApiError(ApiError),
  DecodeError(DecodeError),
  IoError(std::io::Error),
}

impl From<AnyhowError> for InternalImageError {
  fn from(value: AnyhowError) -> Self {
    Self::AnyhowError(value)
  }
}

impl From<FalErrorPlus> for InternalImageError {
  fn from(value: FalErrorPlus) -> Self {
    Self::FalError(value)
  }
}

impl From<SoraError> for InternalImageError {
  fn from(value: SoraError) -> Self {
    Self::SoraError(value)
  }
}

impl From<ApiError> for InternalImageError {
  fn from(value: ApiError) -> Self {
    Self::StorytellerApiError(value)
  }
}

impl From<DecodeError> for InternalImageError {
  fn from(value: DecodeError) -> Self {
    Self::DecodeError(value)
  }
}

impl From<std::io::Error> for InternalImageError {
  fn from(value: std::io::Error) -> Self {
    Self::IoError(value)
  }
}
