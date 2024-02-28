export enum EntityInputMode {
  bookmarks,
  media,
  weights,
  searchWeights,
}

export enum MediaFilters {
  all,
  audio,
  image,
  video,
  bvh,
  glb,
  gltf,
  fbx
}

export enum WeightsFilters {
  all,
  hifigan_tt2,
  rvc_v2,
  sd_1,
  "sd_1.5",
  sdxl,
  so_vits_svc,
  tt2,
  loRA,
  vall_e
}

export enum WeightsCategories {
  all,
  faceAnimation,
  tts,
  voiceConversion
}

export type EntityModeProp = keyof typeof EntityInputMode;
export type MediaFilterProp = keyof typeof MediaFilters;
export type WeightFilterProp = keyof typeof WeightsFilters;
export type WeightCategoriesProp = keyof typeof WeightsCategories;
export type AcceptTypes = MediaFilterProp | WeightFilterProp;
export type JobSelection = WeightCategoriesProp | WeightFilterProp;

export enum EntityType {
  unknown,
  media,
  weights
}

export const ListEntityFilters = (mode?: number) => {
  const bookmarkFilters = Object.keys({ ...MediaFilters, ...WeightsFilters }).filter(val => isNaN(Number(val))).reduce((obj,current) => ({ ...obj, [current]: current  }),{});

  const selectedFilters = mode !== undefined ? [bookmarkFilters,MediaFilters,WeightsFilters,WeightsFilters][mode] : EntityInputMode;

  return Object.values(selectedFilters).filter(val => isNaN(Number(val)));
};

export const EntityFilterOptions = (mode?: EntityInputMode, t = (v:string) => v) => {
  return ListEntityFilters(mode).map((value) => {
    if (typeof value === "string") return { value, label: t(value) }
    return { label: "all", value: "all" };
  });
};