
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
  ($t:ident, $entropy_length:literal, $uppercase:literal, $string_length:literal) => {
    use rand::Rng;

    // Constructors and accessors.
    impl $t {
      #[inline]
      pub fn generate() -> Self {
        let charset = if $uppercase { crate::CROCKFORD_UPPERCASE_CHARSET } else { crate::CROCKFORD_LOWERCASE_CHARSET };

        let mut rng = rand::thread_rng();

        let entropy_part: String = (0..$entropy_length)
          .map(|_| {
            let idx = rng.gen_range(0..charset.len());
            charset[idx] as char
          })
          .collect();

        let token = format!("TOKEN:{}", entropy_part);

        $t(token)
      }
    }
  }
}

