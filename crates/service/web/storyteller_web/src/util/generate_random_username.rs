use filesys::file_lines::iterate_trimmed_file_lines_without_comments::iterate_trimmed_file_lines_without_comments;
use once_cell::sync::Lazy;
use std::collections::HashSet;
use collections::random_from_array::random_from_array;
use primitives::iterators::iterate_trimmed_lines_without_comments::iterate_trimmed_lines_without_comments;
use crate::http_server::validations::validate_username::USERNAME_MAX_LENGTH;

pub const ADJECTIVES : &str = include_str!("../../../../../../includes/binary_includes/usernames/atoms/username_adjectives.txt");
pub const NOUNS : &str = include_str!("../../../../../../includes/binary_includes/usernames/atoms/username_nouns.txt");
pub const NOUNS_ANIMALS: &str = include_str!("../../../../../../includes/binary_includes/usernames/atoms/username_nouns_animals.txt");

fn lines_without_comments() {

}
static ALL_NOUNS : Lazy<Vec<String>> = Lazy::new(|| {
  iterate_trimmed_lines_without_comments(NOUNS.lines())
      .chain(iterate_trimmed_lines_without_comments(NOUNS_ANIMALS.lines()))
      .collect::<HashSet<String>>()
      .into_iter()
      .collect()
});

static ALL_ADJECTIVES : Lazy<Vec<String>> = Lazy::new(|| {
  iterate_trimmed_lines_without_comments(ADJECTIVES.lines())
      .collect::<HashSet<String>>()
      .into_iter()
      .collect::<Vec<String>>()
});

pub fn generate_random_username() -> String {
  for _ in 0..100 {
    if let Some(username) = generate_candidate_username() {
      return username;
    }
  }

  "random_username".to_string()
}

fn generate_candidate_username() -> Option<String> {
  let maybe_adjective = random_from_array::<String>(&ALL_ADJECTIVES);
  let maybe_noun = random_from_array::<String>(&ALL_NOUNS);

  match (maybe_adjective, maybe_noun) {
    (Some(adjective), Some(noun)) => {
      let maybe_username = format!("{}{}", adjective, noun);
      if maybe_username.len() > USERNAME_MAX_LENGTH {
        println!("too long: {}", maybe_username);
        return None;
      }
      Some(maybe_username)
    },
    _ => None
  }
}

#[cfg(test)]
mod tests {
  use crate::util::generate_random_username::generate_random_username;

  #[test]
  fn test() {
    assert_eq!(generate_random_username(), "asdf".to_string());
  }
}
