use once_cell::sync::Lazy;
use regex::Regex;

const PARENS_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"\([^\\()]*\)").unwrap()
});

const SPACE_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"\s+").unwrap()
});

const ENDING_NOISE: Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[^\w]+$").unwrap()
});

const VERSION_REGEX: Lazy<Regex> = Lazy::new(|| {
  // Examples:
  // Versión 2.
  // Version 1.0
  // v2
  Regex::new(r"(?i)(v)(er(si[oó]n)?)?\s*\d+\.?\d*").unwrap()
});


/// Convert a model title to a URL slug.
pub fn title_to_url_slug(title: &str) -> Option<String> {
  let title = title.trim().to_lowercase();
  let title = PARENS_REGEX.replace_all(&title, "").to_string();

  let title = VERSION_REGEX.replace_all(title.trim(), "").to_string();
  let title = SPACE_REGEX.replace_all(title.trim(), "-").to_string();

  let title = ENDING_NOISE.replace_all(title.trim(), "").to_string();

  if title.is_empty() {
    return None;
  } else {
    Some(title)
  }
}

#[cfg(test)]
mod tests {
  use crate::util::title_to_url_slug::title_to_url_slug;

  fn assert_parsed(title: &str, expected: &str) {
    assert_eq!(title_to_url_slug(title).as_deref(), Some(expected));
  }

  #[test]
  fn simple_titles() {
    assert_parsed("Bill Nye", "bill-nye");
  }

  #[test]
  fn removes_parens() {
    assert_parsed("Donald Trump (Angry)", "donald-trump");
    assert_parsed("Lionel Messi. (Español 2020 - 2023.)", "lionel-messi");
    assert_parsed("Mariano Closs (Relator de fútbol Argentino)", "mariano-closs");
    assert_parsed("Mariano Closs (full version)", "mariano-closs");
    assert_parsed("Naruto Uzumaki (Part 1)", "naruto-uzumaki");
    assert_parsed("Waldemaro Martínez. (Locutor de DJ, Latin American Spanish.)", "waldemaro-martínez");
  }

  #[test]
  fn version_strings() {
    assert_parsed("Cristiano Ronaldo. (Español) Versión 2.", "cristiano-ronaldo");
    assert_parsed("Dragonball Z Narrador (Latin, Version 1.0)", "dragonball-z-narrador");
    assert_parsed("Dragonball Z Narrador Version 1.0", "dragonball-z-narrador");
    assert_parsed("Peter Griffin (Classic, Version 2.0)", "peter-griffin");
    assert_parsed("Peter Griffin Version 2.0", "peter-griffin");
  }

  #[test]
  fn removes_spaces() {
    assert_parsed("Goku (Jose Antonio Gavira) (Castillian Spanish)", "goku");
  }

  #[test]
  fn removes_periods() {
    assert_parsed("Vegeta. (IMITADORES.) (Dragon Ball, Latin American Spanish.)", "vegeta");
  }
}
