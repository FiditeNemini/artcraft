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

export type EntityModeProp = keyof typeof EntityInputMode;
export type MediaFilterProp = keyof typeof MediaFilters;
export type WeightFilterProp = keyof typeof WeightsFilters;
export type AcceptTypes = MediaFilterProp | WeightFilterProp;

export enum EntityType {
  unknown,
  media,
  weights
}

export const EntityFilterOptions = ( mode?: EntityInputMode, t = (v:string) => v) => {
  const filters = mode !== undefined ? [{ ...MediaFilters, ...WeightsFilters },MediaFilters,WeightsFilters,WeightsFilters][mode] : EntityInputMode;

  return Object.values(filters)
  .filter(val => isNaN(Number(val)))
  .map((value) => {
    if (typeof value === "string") return { value, label: t(value) }
    return { label: "all", value: "all" };
  });
};