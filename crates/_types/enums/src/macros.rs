
/// Implement `Display` and `Debug` for enums that have a `.to_str()` method.
/// This ensures that the casing follows whatever `.to_str()` specifies.
macro_rules! impl_enum_display_and_debug_using_to_str {
  ($t:ident) => {

    // Debug trait.
    // Requires that the type has `.to_str()`.
    impl std::fmt::Debug for $t {
      fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_str())
      }
    }

    // Display trait.
    // Requires that the type has `.to_str()`.
    impl std::fmt::Display for $t {
      fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_str())
      }
    }

    // NB: This test requires `strum::{EnumIter}` on the enum
    #[cfg(test)]
    #[test]
    fn test_display_trait_matches_to_str() {
      use strum::IntoEnumIterator;
      for variant in $t::iter() {
        assert_eq!(format!("{}", variant), variant.to_str());
      }
    }

    // NB: This test requires `strum::{EnumIter}` on the enum
    #[cfg(test)]
    #[test]
    fn test_debug_trait_matches_to_str() {
      use strum::IntoEnumIterator;
      for variant in $t::iter() {
        assert_eq!(format!("{:?}", variant), variant.to_str());
      }
    }
  }
}

/// This overt approach is being taken because of the following error:
///
///   `MySqlDatabaseError { code: Some("HY000"), number: 1210, message: "Incorrect arguments to mysqld_stmt_execute" }`
///
/// Basically, sqlx can't turn our enum into a VARCHAR when using #[derive(sqlx::Type)].
/// Unfortunately, by not using this, we also lose the ability to `#[sqlx(rename_all="lowercase")]`, etc.,
/// so our encoder/decoder need to set the rules.
///
/// Solution adapted from https://github.com/launchbadge/sqlx/discussions/1502
macro_rules! impl_enum_sqlx_coders {
  ($t:ident) => {

    impl sqlx::Type<sqlx_core::mysql::MySql> for $t {
      fn type_info() -> sqlx_core::mysql::MySqlTypeInfo {
        String::type_info()
      }
    }

    impl<'q> sqlx::Encode<'q, sqlx_core::mysql::MySql> for $t {
      fn encode_by_ref(
        &self,
        buf: &mut <sqlx_core::mysql::MySql as sqlx_core::database::HasArguments<'q>>::ArgumentBuffer
      ) -> sqlx_core::encode::IsNull {
        // NB: In the absence of `#[derive(sqlx::Type)]` and `#sqlx(rename_all="lowercase")]`,
        // this controls the casing of the variants when sent to MySQL.
        self.to_str().encode_by_ref(buf)
      }
    }

    impl<'r> sqlx::Decode<'r, sqlx_core::mysql::MySql> for $t {
      fn decode(
        value: sqlx_core::mysql::MySqlValueRef<'r>,
      ) -> Result<Self, sqlx_core::error::BoxDynError> {
        let string = String::decode(value)?;
        let value = $t::from_str(&string)?;
        Ok(value)
      }
    }

  }
}

