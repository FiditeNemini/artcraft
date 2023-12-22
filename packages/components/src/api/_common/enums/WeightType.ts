export enum WeightType {
  TT2 = "tt2",
  HIFIGAN_TT2 = "hifigan_tt2",
  RVCv2 = "rvc_v2",
  SD_15 = "sd_1.5",
  SDXL = "sdxl",
  SVC = "so_vits_svc",
  LORA = "loRA",
  VALL_E = "vall_e",
}

export const weightTypeInfo = {
  [WeightType.TT2]: { label: "TT2", color: "teal" },
  [WeightType.HIFIGAN_TT2]: {
    label: "HifiGAN TT2",
    color: "blue",
  },
  [WeightType.RVCv2]: { label: "RVCv2", color: "orange" },
  [WeightType.SD_15]: { label: "SD 1.5", color: "green" },
  [WeightType.SDXL]: { label: "SDXL", color: "purple" },
  [WeightType.SVC]: { label: "SVC", color: "cyan" },
  [WeightType.LORA]: { label: "LoRA", color: "pink" },
  [WeightType.VALL_E]: { label: "VALL-E", color: "ultramarine" },
};
