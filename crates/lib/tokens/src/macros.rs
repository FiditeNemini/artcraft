
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
  ($t:ident, $total_string_length:literal, $token_prefix:literal, $uppercase:literal) => {
    impl $t {
      /// Constructor for a new token.
      #[inline]
      pub fn generate() -> Self {
        use rand::Rng;

        let charset = if $uppercase { crate::CROCKFORD_UPPERCASE_CHARSET } else { crate::CROCKFORD_LOWERCASE_CHARSET };

        let mut rng = rand::thread_rng();

        let entropy_length = Self::entropic_character_len();

        let entropy_part: String = (0..entropy_length)
          .map(|_| {
            let idx = rng.gen_range(0..charset.len());
            charset[idx] as char
          })
          .collect();

        let token = format!("{}{}", $token_prefix, entropy_part);

        $t(token)
      }

      #[inline]
      pub fn entropic_character_len() -> usize {
        $total_string_length.saturating_sub($token_prefix.len())
      }
    }

    #[cfg(test)]
    #[test]
    fn test_entropy() {
      assert!($t::entropic_character_len() > 100);
    }

    #[cfg(test)]
    #[test]
    fn test_token_length() {
      assert_eq!($t::generate().as_str(), "foo");
    }
  }
}
