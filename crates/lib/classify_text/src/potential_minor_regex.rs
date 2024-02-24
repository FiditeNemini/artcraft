use once_cell::sync::Lazy;
use regex::RegexSet;

pub (crate) fn lowercase_mentions_potential_underage(text: &str) -> bool {
  let text = text.to_lowercase();

  // NB: Unfortunately Rust Regex does not support look-around, so our age matching is awkward
  // Matching digits "0" and "1" are tricky because they would match "19" and "0100".
  static AGE_REGEX: Lazy<RegexSet> = Lazy::new(|| {
    let patterns = [
      // English
      r"\b(teen(age(r)?)?s?)\b",
      r"\b(young|tiny|small|petite)\b(.{0,7})\b(girl|boy)s?\b",

    ];
    RegexSet::new(&patterns).expect("regex should be valid")
  });

  //println!("text: {:?}", text);

  AGE_REGEX.matches(&text).matched_any()
}

#[cfg(test)]
mod tests {

  mod english {

    mod positive_match {
      use crate::potential_minor_regex::lowercase_mentions_potential_underage;

      #[test]
      fn spot_check_matches() {
        assert!(lowercase_mentions_potential_underage("teen"));
        assert!(lowercase_mentions_potential_underage("teens"));
        assert!(lowercase_mentions_potential_underage("teenage"));
        assert!(lowercase_mentions_potential_underage("teenager"));
        assert!(lowercase_mentions_potential_underage("teenagers"));

        assert!(lowercase_mentions_potential_underage("tiny girl"));
        assert!(lowercase_mentions_potential_underage("tiny boy"));
        assert!(lowercase_mentions_potential_underage("small boy"));
        assert!(lowercase_mentions_potential_underage("small girl"));

        assert!(lowercase_mentions_potential_underage("tiny girls"));
        assert!(lowercase_mentions_potential_underage("tiny boys"));
        assert!(lowercase_mentions_potential_underage("small boys"));
        assert!(lowercase_mentions_potential_underage("small girls"));

        assert!(lowercase_mentions_potential_underage("young girl"));
        assert!(lowercase_mentions_potential_underage("young boy"));
        assert!(lowercase_mentions_potential_underage("young boy"));
        assert!(lowercase_mentions_potential_underage("young girl"));

        assert!(lowercase_mentions_potential_underage("petite girl"));
        assert!(lowercase_mentions_potential_underage("petite boy"));
        assert!(lowercase_mentions_potential_underage("petite boy"));
        assert!(lowercase_mentions_potential_underage("petite girl"));
      }
    }
  }
}
