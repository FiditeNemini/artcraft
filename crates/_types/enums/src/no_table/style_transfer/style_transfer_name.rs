use std::collections::BTreeSet;

#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;
use utoipa::ToSchema;

/// This enum is not backed by a particular database table.
/// It's used in APIs and Jobs to agree upon ComfyUI style transfer style configurations.
///
/// DO NOT CHANGE VALUES WITHOUT A MIGRATION STRATEGY.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash, Deserialize, Serialize, ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum StyleTransferName {
  #[serde(rename = "anime_2_5d")]
  Anime2_5D,
  #[serde(rename = "anime_2d_flat")]
  Anime2DFlat,
  #[serde(rename = "cartoon_3d")]
  Cartoon3D,
  #[serde(rename = "comic_book")]
  ComicBook,
  #[serde(rename = "anime_ghibli")]
  AnimeGhibli,
  #[serde(rename = "ink_punk")]
  InkPunk,
  #[serde(rename = "ink_splash")]
  InkSplash,
  #[serde(rename = "ink_bw_style")]
  InkBWStyle,
  #[serde(rename = "jojo_style")]
  JojoStyle,
  #[serde(rename = "paper_origami")]
  PaperOrigami,
  #[serde(rename = "pixel_art")]
  PixelArt,
  #[serde(rename = "pop_art")]
  PopArt,
  #[serde(rename = "realistic_1")]
  Realistic1,
  #[serde(rename = "realistic_2")]
  Realistic2,
  #[serde(rename = "anime_retro_neon")]
  AnimeRetroNeon,
  #[serde(rename = "anime_standard")]
  AnimeStandard
}

// TODO(bt, 2022-12-21): This desperately needs MySQL integration tests!
impl_enum_display_and_debug_using_to_str!(StyleTransferName);
//impl_mysql_enum_coders!(StyleTransferName);
//impl_mysql_from_row!(StyleTransferName);

/// NB: Legacy API for older code.
impl StyleTransferName {
  pub fn to_str(&self) -> &'static str {
    match self {
        Self::Anime2_5D => "anime_2_5d",
        Self::Anime2DFlat => "anime_2d_flat",
        Self::Cartoon3D => "cartoon_3d",
        Self::ComicBook => "comic_book",
        Self::AnimeGhibli => "anime_ghibli",
        Self::InkPunk => "ink_punk",
        Self::InkSplash => "ink_splash",
        Self::InkBWStyle => "ink_bw_style",
        Self::JojoStyle => "jojo_style",
        Self::PaperOrigami => "paper_origami",
        Self::PixelArt => "pixel_art",
        Self::PopArt => "pop_art",
        Self::Realistic1 => "realistic_1",
        Self::Realistic2 => "realistic_2",
        Self::AnimeRetroNeon => "anime_retro_neon",
        Self::AnimeStandard => "anime_standard",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      "anime_2_5d" => Ok(Self::Anime2_5D),
      "anime_2d_flat" => Ok(Self::Anime2DFlat),
      "cartoon_3d" => Ok(Self::Cartoon3D),
      "comic_book" => Ok(Self::ComicBook),
      "anime_ghibli" => Ok(Self::AnimeGhibli),
      "ink_punk" => Ok(Self::InkPunk),
      "ink_splash" => Ok(Self::InkSplash),
      "ink_bw_style" => Ok(Self::InkBWStyle),
      "jojo_style" => Ok(Self::JojoStyle),
      "paper_origami" => Ok(Self::PaperOrigami),
      "pixel_art" => Ok(Self::PixelArt),
      "pop_art" => Ok(Self::PopArt),
      "realistic_1" => Ok(Self::Realistic1),
      "realistic_2" => Ok(Self::Realistic2),
      "anime_retro_neon" => Ok(Self::AnimeRetroNeon),
      "anime_standard" => Ok(Self::AnimeStandard),
      _ => Err(format!("Unknown StyleTransferName: {}", value)),
    }
  }

  pub fn to_filename(&self) -> &'static str {
    match self {
      Self::Anime2_5D => "1_2.5d_anime_model.json",
      Self::Anime2DFlat => "2_2d_flat_anime_model.json",
      Self::Cartoon3D => "3_3d_cartoon_style.json",
      Self::ComicBook => "4_comic_book_model.json",
      Self::AnimeGhibli => "5_ghibli_anime_model.json",
      Self::InkPunk => "6_ink_punk.json",
      Self::InkSplash => "7_ink_splash.json",
      Self::InkBWStyle => "8_ink_w_and_b_style.json",
      Self::JojoStyle => "9_jojo_style.json",
      Self::PaperOrigami => "10_paper_origami.json",
      Self::PixelArt => "11_pixel_art.json",
      Self::PopArt => "12_pop_art.json",
      Self::Realistic1 => "13_realistic_1.json",
      Self::Realistic2 => "14_realistic_2.json",
      Self::AnimeRetroNeon => "15_retro_neon_anime_90.json",
      Self::AnimeStandard => "16_standard_anime_model.json",
    }
  }

  pub fn all_variants() -> BTreeSet<Self> {
    // NB: BTreeSet is sorted
    // NB: BTreeSet::from() isn't const, but not worth using LazyStatic, etc.
    BTreeSet::from([
      Self::Anime2_5D,
      Self::Anime2DFlat,
      Self::Cartoon3D,
      Self::ComicBook,
      Self::AnimeGhibli,
      Self::InkPunk,
      Self::InkSplash,
      Self::InkBWStyle,
      Self::JojoStyle,
      Self::PaperOrigami,
      Self::PixelArt,
      Self::PopArt,
      Self::Realistic1,
      Self::Realistic2,
      Self::AnimeRetroNeon,
      Self::AnimeStandard,
    ])
  }
}

#[cfg(test)]
mod tests {
  use crate::no_table::style_transfer::style_transfer_name::StyleTransferName;
  use crate::test_helpers::assert_serialization;

  mod serde {
    use super::*;

    #[test]
    fn test_serialization() {
      assert_serialization(StyleTransferName::Anime2_5D, r#"anime_2_5d"#);
      assert_serialization(StyleTransferName::Anime2DFlat, r#"anime_2d_flat"#);
      assert_serialization(StyleTransferName::Cartoon3D, r#"cartoon_3d"#);
      assert_serialization(StyleTransferName::ComicBook, r#"comic_book"#);
      assert_serialization(StyleTransferName::AnimeGhibli, r#"anime_ghibli"#);
      assert_serialization(StyleTransferName::InkPunk, r#"ink_punk"#);
      assert_serialization(StyleTransferName::InkSplash, r#"ink_splash"#);
      assert_serialization(StyleTransferName::InkBWStyle, r#"ink_bw_style"#);
      assert_serialization(StyleTransferName::JojoStyle, r#"jojo_style"#);
      assert_serialization(StyleTransferName::PaperOrigami, r#"paper_origami"#);
      assert_serialization(StyleTransferName::PixelArt, r#"pixel_art"#);
      assert_serialization(StyleTransferName::PopArt, r#"pop_art"#);
      assert_serialization(StyleTransferName::Realistic1, r#"realistic_1"#);
      assert_serialization(StyleTransferName::Realistic2, r#"realistic_2"#);
      assert_serialization(StyleTransferName::AnimeRetroNeon, r#"anime_retro_neon"#);
      assert_serialization(StyleTransferName::AnimeStandard, r#"anime_standard"#);
    }

    mod impl_methods {
      use super::*;

      #[test]
      fn to_str() {
        assert_eq!(StyleTransferName::Anime2_5D.to_str(), "anime_2_5d");
        assert_eq!(StyleTransferName::Anime2DFlat.to_str(), "anime_2d_flat");
        assert_eq!(StyleTransferName::Cartoon3D.to_str(), "cartoon_3d");
        assert_eq!(StyleTransferName::ComicBook.to_str(), "comic_book");
        assert_eq!(StyleTransferName::AnimeGhibli.to_str(), "anime_ghibli");
        assert_eq!(StyleTransferName::InkPunk.to_str(), "ink_punk");
        assert_eq!(StyleTransferName::InkSplash.to_str(), "ink_splash");
        assert_eq!(StyleTransferName::InkBWStyle.to_str(), "ink_bw_style");
        assert_eq!(StyleTransferName::JojoStyle.to_str(), "jojo_style");
        assert_eq!(StyleTransferName::PaperOrigami.to_str(), "paper_origami");
        assert_eq!(StyleTransferName::PixelArt.to_str(), "pixel_art");
        assert_eq!(StyleTransferName::PopArt.to_str(), "pop_art");
        assert_eq!(StyleTransferName::Realistic1.to_str(), "realistic_1");
        assert_eq!(StyleTransferName::Realistic2.to_str(), "realistic_2");
        assert_eq!(StyleTransferName::AnimeRetroNeon.to_str(), "anime_retro_neon");
        assert_eq!(StyleTransferName::AnimeStandard.to_str(), "anime_standard");
      }

      #[test]
      fn from_str() {
        assert_eq!(StyleTransferName::from_str("anime_2_5d").unwrap(), StyleTransferName::Anime2_5D);
        assert_eq!(StyleTransferName::from_str("anime_2d_flat").unwrap(), StyleTransferName::Anime2DFlat);
        assert_eq!(StyleTransferName::from_str("cartoon_3d").unwrap(), StyleTransferName::Cartoon3D);
        assert_eq!(StyleTransferName::from_str("comic_book").unwrap(), StyleTransferName::ComicBook);
        assert_eq!(StyleTransferName::from_str("anime_ghibli").unwrap(), StyleTransferName::AnimeGhibli);
        assert_eq!(StyleTransferName::from_str("ink_punk").unwrap(), StyleTransferName::InkPunk);
        assert_eq!(StyleTransferName::from_str("ink_splash").unwrap(), StyleTransferName::InkSplash);
        assert_eq!(StyleTransferName::from_str("ink_bw_style").unwrap(), StyleTransferName::InkBWStyle);
        assert_eq!(StyleTransferName::from_str("jojo_style").unwrap(), StyleTransferName::JojoStyle);
        assert_eq!(StyleTransferName::from_str("paper_origami").unwrap(), StyleTransferName::PaperOrigami);
        assert_eq!(StyleTransferName::from_str("pixel_art").unwrap(), StyleTransferName::PixelArt);
        assert_eq!(StyleTransferName::from_str("pop_art").unwrap(), StyleTransferName::PopArt);
        assert_eq!(StyleTransferName::from_str("realistic_1").unwrap(), StyleTransferName::Realistic1);
        assert_eq!(StyleTransferName::from_str("realistic_2").unwrap(), StyleTransferName::Realistic2);
        assert_eq!(StyleTransferName::from_str("anime_retro_neon").unwrap(), StyleTransferName::AnimeRetroNeon);
        assert_eq!(StyleTransferName::from_str("anime_standard").unwrap(), StyleTransferName::AnimeStandard);
        assert!(StyleTransferName::from_str("foo").is_err());
      }
    }

    mod manual_variant_checks {
      use super::*;

      #[test]
      fn all_variants() {
        let variants = StyleTransferName::all_variants();
        assert_eq!(variants.len(), 16);
      }
    }

    mod mechanical_checks {
      use super::*;

      #[test]
      fn variant_length() {
        use strum::IntoEnumIterator;
        assert_eq!(StyleTransferName::all_variants().len(), StyleTransferName::iter().len());
      }

      #[test]
      fn round_trip() {
        for variant in StyleTransferName::all_variants() {
          assert_eq!(variant, StyleTransferName::from_str(variant.to_str()).unwrap());
          assert_eq!(variant, StyleTransferName::from_str(&format!("{}", variant)).unwrap());
          assert_eq!(variant, StyleTransferName::from_str(&format!("{:?}", variant)).unwrap());
        }
      }
    }
  }
}