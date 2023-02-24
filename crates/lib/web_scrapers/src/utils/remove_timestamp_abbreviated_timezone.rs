// NB: Having a hard time parsing time zones. Just lazily nuke them for now.
pub fn remove_timestamp_abbreviated_timezone(timestamp: &str) -> String {
  // TODO: More efficient regex-based solution
  timestamp.replace("EST", "")
      .replace("EDT", "")
      .replace("ET", "")
      .replace("CST", "")
      .replace("CDT", "")
      .replace("CT", "")
      .replace("MST", "")
      .replace("MDT", "")
      .replace("MT", "")
      .replace("PST", "")
      .replace("PDT", "")
      .replace("PT", "")
}