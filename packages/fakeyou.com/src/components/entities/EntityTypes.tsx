export enum MediaFilters {
  all,
  audio,
  image,
  video,
  bvh,
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

export type MediaFilterProp = keyof typeof MediaFilters;
export type WeightFilterProp = keyof typeof WeightsFilters;

export enum EntityType {
  unknown,
  media,
  weights
}

export const EntityFilterOptions = ( mode: EntityType, t = (v:string) => v) => {
  const filters = [{},MediaFilters,WeightsFilters][mode];
  return mode ? Object.values(filters)
  .filter(val => isNaN(Number(val)))
  .map((value) => {
    if (typeof value === "string") return { value, label: t(value) }
    return { label: "all", value: "all" };
  }) : [];
};