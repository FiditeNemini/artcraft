
const DEFAULT_BINARY_MIMETYPE : &'static str = "application/octet-stream";

pub fn get_mimetype_for_bytes(bytes: &[u8]) -> Option<&'static str> {
  infer::get(bytes)
      .map(|typ| typ.mime_type())
}

pub fn get_mimetype_for_bytes_or_default(bytes: &[u8]) -> &'static str {
  infer::get(bytes)
      .map(|typ| typ.mime_type())
      .unwrap_or(DEFAULT_BINARY_MIMETYPE)
}
