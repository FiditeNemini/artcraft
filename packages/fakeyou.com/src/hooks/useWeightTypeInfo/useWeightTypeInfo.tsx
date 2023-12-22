import { WeightType } from "@storyteller/components/src/api/_common/enums/WeightType";

type WeightTypeInfo = {
  [key in WeightType]: { label: string; color: string };
};

const weightTypeInfo: WeightTypeInfo = {
  [WeightType.TT2]: { label: "TT2", color: "teal" },
  [WeightType.HIFIGAN_TT2]: { label: "HifiGAN TT2", color: "blue" },
  [WeightType.RVCv2]: { label: "RVCv2", color: "orange" },
  [WeightType.SD_15]: { label: "SD 1.5", color: "green" },
  [WeightType.SDXL]: { label: "SDXL", color: "purple" },
  [WeightType.SVC]: { label: "SVC", color: "cyan" },
  [WeightType.LORA]: { label: "LoRA", color: "pink" },
  [WeightType.VALL_E]: { label: "VALL-E", color: "ultramarine" },
};

export default function useWeightTypeInfo(weightsType: WeightType) {
  return (
    weightTypeInfo[weightsType] || {
      label: "Unknown",
      color: "gray",
    }
  );
}
