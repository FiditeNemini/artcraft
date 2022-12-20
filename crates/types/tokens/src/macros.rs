
// Default methods for string wrapper types.
macro_rules! impl_string_token {
  ($t:ident) => {
    // Constructors and accessors.
    impl $t {
      #[inline]
      pub fn new(value: String) -> Self {
        $t(value)
      }

      #[inline]
      pub fn new_from_str(value: &str) -> Self {
        $t(value.to_string())
      }

      #[inline]
      pub fn as_str(&self) -> &str {
        &self.0
      }
    }

    // Display trait.
    impl std::fmt::Display for $t {
      fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
      }
    }
  }
}

macro_rules! impl_crockford_generator {
  ($t:ident, $total_string_length:literal, $variant:path, $character_case:ident) => {
    impl $t {
      /// Constructor for a new token.
      #[inline]
      pub fn generate() -> Self {
        use rand::Rng;

        let mut rng = rand::thread_rng();

        let charset = Self::token_character_set();
        let entropy_length = Self::entropic_character_len();

        let entropy_part: String = (0..entropy_length)
          .map(|_| {
            let idx = rng.gen_range(0..charset.len());
            charset[idx] as char
          })
          .collect();

        let token_prefix = Self::token_prefix();

        let token = format!("{}{}", token_prefix, entropy_part);

        $t(token)
      }

      #[inline]
      pub fn entropic_character_len() -> usize {
        let token_prefix = Self::token_prefix();
        $total_string_length.saturating_sub(token_prefix.len())
      }

      #[inline]
      pub fn token_prefix() -> &'static str {
        $variant.prefix()
      }

      #[inline]
      pub fn token_character_set() -> &'static [u8] {
        match crate::TokenCharacterSet::$character_case {
          crate::TokenCharacterSet::CrockfordUpper => crate::CROCKFORD_UPPERCASE_CHARSET,
          crate::TokenCharacterSet::CrockfordLower => crate::CROCKFORD_LOWERCASE_CHARSET,
          crate::TokenCharacterSet::CrockfordMixed => crate::CROCKFORD_MIXED_CASE_CHARSET,
        }
      }
    }

    #[cfg(test)]
    #[test]
    fn test_entropy_is_sufficient() {
      assert!($t::entropic_character_len() > crate::MINIMUM_CHARACTER_ENTROPY);
    }

    #[cfg(test)]
    #[test]
    fn test_token_length() {
      assert_eq!($t::generate().as_str().len(), $total_string_length);
    }

    #[cfg(test)]
    #[test]
    fn test_tokens_are_random() {
      let mut tokens = std::collections::HashSet::new();
      for _ in 0..100 {
        tokens.insert($t::generate().to_string());
      }
      assert_eq!(tokens.len(), 100);
    }

    #[cfg(test)]
    #[test]
    fn test_character_set() {
      let token_string = $t::generate().to_string();
      let prefix = $t::token_prefix();
      let random_part = token_string.replace(prefix, "");

      assert!(random_part.len() > crate::MINIMUM_CHARACTER_ENTROPY);

      match crate::TokenCharacterSet::$character_case {
        crate::TokenCharacterSet::CrockfordUpper => assert!(random_part.chars().all(|c| c.is_numeric() || c.is_uppercase())),
        crate::TokenCharacterSet::CrockfordLower => assert!(random_part.chars().all(|c| c.is_numeric() || c.is_lowercase())),
        crate::TokenCharacterSet::CrockfordMixed => assert!(random_part.chars().all(|c| c.is_numeric() || c.is_uppercase() || c.is_lowercase())),
      }
    }

    #[cfg(test)]
    #[test]
    fn test_prefix_ends_with_separator() {
      let prefix = $t::token_prefix();
      assert!(prefix.ends_with(":") || prefix.ends_with("_"));

      let token_string = $t::generate().to_string();
      assert!(token_string.contains(":") || token_string.contains("_"));
    }

    #[cfg(test)]
    #[test]
    fn test_token_begins_with_prefix() {
      let prefix = $t::token_prefix();
      let token_string = $t::generate().to_string();
      assert!(token_string.starts_with(prefix));
    }
  }
}
