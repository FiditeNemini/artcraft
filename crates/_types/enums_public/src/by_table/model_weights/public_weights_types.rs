#[cfg(test)]
use strum::EnumCount;
#[cfg(test)]
use strum::EnumIter;
use utoipa::ToSchema;

use enums::by_table::model_weights::weights_types::WeightsType;

/// Report certain models publicly as different from what we actually use.
/// This is so we have an edge against the competition that might try to run
/// the same models. This won't always make sense, but in some cases it will.
#[cfg_attr(test, derive(EnumIter, EnumCount))]
#[derive(Clone, Copy, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize, ToSchema, Debug)]
pub enum PublicWeightsType {
  // Renamed enum variants

  /// Instead of `WeightsType::GptSoVits` ("gpt_so_vits")
  #[serde(rename = "tacotron2.5")]
  Tacotron2_5,

  // Everything else is the same

  #[serde(rename = "hifigan_tt2")]
  HifiganTacotron2,
  #[serde(rename = "rvc_v2")]
  RvcV2,
  #[serde(rename = "sd_1.5")]
  StableDiffusion15,
  #[serde(rename = "sdxl")]
  StableDiffusionXL,
  #[serde(rename = "so_vits_svc")]
  SoVitsSvc,
  #[serde(rename = "tt2")]
  Tacotron2,
  #[serde(rename = "loRA")]
  LoRA,
  #[serde(rename = "vall_e")]
  VallE,
  #[serde(rename = "comfy_ui")]
  ComfyUi,
}

impl PublicWeightsType {
  pub fn to_str(&self) -> &'static str {
    match self {
      // Renamed variants
      Self::Tacotron2_5 => "tacotron2.5",
      // Conserved variants
      Self::HifiganTacotron2 => "hifigan_tt2",
      Self::RvcV2 => "rvc_v2",
      Self::StableDiffusion15 => "sd_1.5",
      Self::StableDiffusionXL => "sdxl",
      Self::SoVitsSvc => "so_vits_svc",
      Self::Tacotron2 => "tt2",
      Self::LoRA => "loRA",
      Self::VallE => "vall_e",
      Self::ComfyUi => "comfy_ui",
    }
  }

  pub fn from_str(value: &str) -> Result<Self, String> {
    match value {
      // Renamed variants
      "tacotron2.5" => Ok(Self::Tacotron2_5),
      // Conserved variants
      "hifigan_tt2" => Ok(Self::HifiganTacotron2),
      "rvc_v2" => Ok(Self::RvcV2),
      "sd_1.5" => Ok(Self::StableDiffusion15),
      "sdxl" => Ok(Self::StableDiffusionXL),
      "so_vits_svc" => Ok(Self::SoVitsSvc),
      "tt2" => Ok(Self::Tacotron2),
      "loRA" => Ok(Self::LoRA),
      "vall_e" => Ok(Self::VallE),
      "comfy_ui" => Ok(Self::ComfyUi),
      _ => Err(format!("invalid value: {:?}", value)),
    }
  }

  pub fn from_enum(weights_type: WeightsType) -> Self {
    match weights_type {
      // Renamed variants
      WeightsType::GptSoVits => Self::Tacotron2_5,
      // Conserved variants
      WeightsType::HifiganTacotron2 => Self::HifiganTacotron2,
      WeightsType::RvcV2 => Self::RvcV2,
      WeightsType::StableDiffusion15 => Self::StableDiffusion15,
      WeightsType::StableDiffusionXL => Self::StableDiffusionXL,
      WeightsType::SoVitsSvc => Self::SoVitsSvc,
      WeightsType::Tacotron2 => Self::Tacotron2,
      WeightsType::LoRA => Self::LoRA,
      WeightsType::VallE => Self::VallE,
      WeightsType::ComfyUi => Self::ComfyUi,
    }
  }

  pub fn to_enum(&self) -> WeightsType {
    match self {
      // Renamed variants
      Self::Tacotron2_5 => WeightsType::GptSoVits,
      // Conserved variants
      Self::HifiganTacotron2 => WeightsType::HifiganTacotron2,
      Self::RvcV2 => WeightsType::RvcV2,
      Self::StableDiffusion15 => WeightsType::StableDiffusion15,
      Self::StableDiffusionXL => WeightsType::StableDiffusionXL,
      Self::SoVitsSvc => WeightsType::SoVitsSvc,
      Self::Tacotron2 => WeightsType::Tacotron2,
      Self::LoRA => WeightsType::LoRA,
      Self::VallE => WeightsType::VallE,
      Self::ComfyUi => WeightsType::ComfyUi,
    }
  }
}

#[cfg(test)]
mod tests {
  use strum::IntoEnumIterator;

  use crate::test_helpers::to_json;

  use super::*;

  fn override_enums() -> &'static [PublicWeightsType; 1] {
    &[
      PublicWeightsType::Tacotron2_5,
    ]
  }

  mod override_values {
    use super::*;

    #[test]
    fn gpt_so_vits() {
      // Public --> Internal
      assert_eq!(PublicWeightsType::Tacotron2_5.to_enum(), WeightsType::GptSoVits);
      assert_eq!(to_json(&PublicWeightsType::Tacotron2_5.to_enum()), "gpt_so_vits");

      // Internal --> Public
      assert_eq!(PublicWeightsType::from_enum(WeightsType::GptSoVits), PublicWeightsType::Tacotron2_5);
      assert_eq!(to_json(&PublicWeightsType::from_enum(WeightsType::GptSoVits)), "tacotron2.5");
    }
  }

  mod mechanical_checks {
    use super::*;

    #[test]
    fn public_to_internal() {
      let mut tested_count = 0;

      for public_variant in PublicWeightsType::iter() {
        if public_variant == PublicWeightsType::Tacotron2_5 {
          continue; // Can't compare.
        }

        // Round trip
        assert_eq!(public_variant, PublicWeightsType::from_enum(public_variant.to_enum()));

        let internal_enum_variant = public_variant.to_enum();
        let internal_enum_string = to_json(&internal_enum_variant);
        let public_enum_string = to_json(&public_variant);

        assert_eq!(internal_enum_string, public_enum_string);

        tested_count += 1;
      }

      assert!(tested_count > 1);
      assert_eq!(tested_count, PublicWeightsType::iter().len() - override_enums().len());
    }

    #[test]
    fn internal_to_public() {
      let mut tested_count = 0;

      for internal_variant in WeightsType::all_variants() {
        if internal_variant == WeightsType::GptSoVits {
          continue; // Can't compare.
        }

        // Round trip
        assert_eq!(internal_variant, PublicWeightsType::from_enum(internal_variant).to_enum());

        let public_enum_variant = PublicWeightsType::from_enum(internal_variant);
        let public_enum_string = to_json(&public_enum_variant);
        let internal_enum_string = to_json(&internal_variant);

        // Same serialization
        assert_eq!(internal_enum_string, public_enum_string);

        tested_count += 1;
      }

      assert!(tested_count > 1);
      assert_eq!(tested_count, WeightsType::all_variants().len() - override_enums().len());
    }

    #[test]
    fn str_round_trip() {
      for variant in WeightsType::all_variants() {
        let variant = PublicWeightsType::from_enum(variant);
        assert_eq!(variant, PublicWeightsType::from_str(variant.to_str()).unwrap());
        // NB: Debug and Display are broken:
        //assert_eq!(variant, PublicWeightsType::from_str(&format!("{}", variant)).unwrap());
        //assert_eq!(variant, PublicWeightsType::from_str(&format!("{:?}", variant)).unwrap());
      }
    }
  }
}
