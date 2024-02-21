use std::collections::HashSet;

use once_cell::sync::Lazy;
use regex::Regex;

use crate::minor_regex::lowercase_mentions_underage;

const CHILD_TERMS : &str = include_str!("../../../../includes/binary_includes/dictionary_children_terms.txt");
const SEX_TERMS : &str = include_str!("../../../../includes/binary_includes/dictionary_sex_terms.txt");
const RACIST_TERMS : &str = include_str!("../../../../includes/binary_includes/dictionary_racist_terms.txt");

/// Classification of a text prompt
pub struct PromptClassification {
  pub prompt_references_children: bool,
  pub prompt_references_sex: bool,
  pub prompt_references_violence: bool,
  pub prompt_references_racism: bool,
}

impl PromptClassification {
  pub fn is_abusive(&self) -> bool {
    self.prompt_references_racism || self.is_child_abuse()

  }

  pub fn is_child_abuse(&self) -> bool {
    self.prompt_references_children && ( self.prompt_references_sex || self.prompt_references_violence )
  }
}


pub fn classify_prompt(text_prompt: &str) -> PromptClassification  {
  let text_prompt = text_prompt.to_lowercase();

  let prompt_tokens_alpha = SPACES_REGEX.split(&text_prompt)
      .map(|term| term.trim().to_string())
      .map(|term| term.chars().filter(|c| c.is_alphanumeric()).collect::<String>())
      .collect::<Vec<String>>();

  let prompt_tokens_lower = SPACES_REGEX.split(&text_prompt)
      .map(|term| term.trim().to_string())
      .collect::<Vec<String>>();

  let mut prompt_tokens= Vec::with_capacity(prompt_tokens_alpha.len() + prompt_tokens_lower.len());

  prompt_tokens.extend(prompt_tokens_alpha);
  prompt_tokens.extend(prompt_tokens_lower);

  let mut prompt_references_children = references_children(&prompt_tokens);
  let prompt_references_sex = references_sex(&prompt_tokens);
  let prompt_references_violence = references_violence(&prompt_tokens);
  let prompt_references_racism = references_racism(&prompt_tokens);

  if lowercase_mentions_underage(&text_prompt) {
    prompt_references_children = true;
  }

  PromptClassification {
    prompt_references_children,
    prompt_references_sex,
    prompt_references_violence,
    prompt_references_racism,
  }
}



fn references_children(prompt_tokens: &[String]) -> bool {
  static CHILD_TERM_DICTIONARY : Lazy<HashSet<String>> = Lazy::new(|| {
    CHILD_TERMS.lines()
        .map(|line| line.trim().to_lowercase())
        .filter(|line| !line.is_empty() && !line.starts_with("#"))
        .collect::<HashSet<String>>()
  });

  prompt_tokens.iter().any(|term| CHILD_TERM_DICTIONARY.contains(term))
}

fn references_sex(prompt_tokens: &[String]) -> bool {
  static SEX_TERM_DICTIONARY : Lazy<HashSet<String>> = Lazy::new(|| {
    SEX_TERMS.lines()
        .map(|line| line.trim().to_lowercase())
        .filter(|line| !line.is_empty() && !line.starts_with("#"))
        .collect::<HashSet<String>>()
  });

  prompt_tokens.iter().any(|term| SEX_TERM_DICTIONARY.contains(term))
}

fn references_violence(_prompt_tokens: &[String]) -> bool {
  // TODO(bt,2024-02-19): Need to implement
  false
}

fn references_racism(prompt_tokens: &[String]) -> bool {
  static RACIST_TERM_DICTIONARY : Lazy<HashSet<String>> = Lazy::new(|| {
    RACIST_TERMS.lines()
        .map(|line| line.trim().to_lowercase())
        .filter(|line| !line.is_empty() && !line.starts_with("#"))
        .collect::<HashSet<String>>()
  });

  prompt_tokens.iter().any(|term| RACIST_TERM_DICTIONARY.contains(term))
}

static SPACES_REGEX : Lazy<Regex> = Lazy::new(|| {
  Regex::new(r"[\s,;]+").expect("regex should be valid")
});


#[cfg(test)]
mod tests {
  use speculoos::asserting;

  use crate::classify_prompt::SPACES_REGEX;

  fn regex_split(text: &str) -> Vec<&str> {
    SPACES_REGEX.split(text).map(|s| s.trim()).collect()
  }

  #[test]
  fn test_regex() {
    asserting("regex works")
        .that(&regex_split("foo,bar,baz"))
        .is_equal_to(vec!["foo", "bar", "baz"]);

    asserting("regex works")
        .that(&regex_split("foo;bar;baz"))
        .is_equal_to(vec!["foo", "bar", "baz"]);

    asserting("regex works")
        .that(&regex_split("foo, bar, baz"))
        .is_equal_to(vec!["foo", "bar", "baz"]);

    asserting("regex works")
        .that(&regex_split("foo\n\nbar  baz"))
        .is_equal_to(vec!["foo", "bar", "baz"]);
  }

}
