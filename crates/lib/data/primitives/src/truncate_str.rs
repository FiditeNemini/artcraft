
/// Truncate a string based on character length, not byte length.
/// Taken from https://stackoverflow.com/a/38461750
pub fn truncate_str(s: &str, max_chars: usize) -> &str {
  match s.char_indices().nth(max_chars) {
    None => s,
    Some((idx, _)) => &s[..idx],
  }
}