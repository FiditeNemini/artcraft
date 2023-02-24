// NB: Having a hard time parsing dates with "%a", and it also appears to be an issue in other
// languages, eg. PHP online tools for strptime, etc. Let's just get rid of it.
pub fn remove_timestamp_abbreviated_weekday_name(timestamp: &str) -> String {
  // TODO: More efficient regex-based solution
  timestamp.replace("Sun", "")
      .replace("Mon", "")
      .replace("Tue", "")
      .replace("Wed", "")
      .replace("Thu", "")
      .replace("Fri", "")
      .replace("Sat", "")
}