
/// Provide a best guess extension for the given mime type.
/// Extensions do not include a "." (period) prefix.
pub fn mimetype_to_extension(mimetype: &str) -> Option<&'static str> {
  // TODO(bt,2023-11-17): maybe make a bidirectional map
  match mimetype {
    // Audio
    "audio/aac" => Some("aac"),
    "audio/m4a" => Some("m4a"),
    "audio/mpeg" => Some("mp3"),
    "audio/ogg" => Some("ogg"),
    "audio/opus" => Some("opus"),
    "audio/x-flac" => Some("flac"),
    "audio/wav" => Some("wav"),
    "audio/x-wav" => Some("wav"),
    // Video
    "video/webm" => Some("webm"), // TODO: Browsers send this for audio?
    _ => None
  }
}

#[cfg(test)]
mod test {
  use crate::mimetype_to_extension::mimetype_to_extension;

  #[test]
  fn no_value() {
    assert_eq!(mimetype_to_extension(""), None);
    assert_eq!(mimetype_to_extension("blah"), None);
    assert_eq!(mimetype_to_extension("nothing"), None);
  }

  #[test]
  fn mime_type_spot_check() {
    assert_eq!(mimetype_to_extension("audio/mpeg"), Some("mp3"));
    assert_eq!(mimetype_to_extension("audio/wav"), Some("wav"));
    assert_eq!(mimetype_to_extension("audio/x-wav"), Some("wav"));
  }
}