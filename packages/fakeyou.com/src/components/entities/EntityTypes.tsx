export enum MediaFilters {
  all,
  audio,
  image,
  video,
  bvh,
  gltf,
  fbx
}

export type MediaFilterProp = keyof typeof MediaFilters;

export const MediaFilterOptions = (t = (v:string) => v) => Object.values(MediaFilters)
  .filter(val => isNaN(Number(val)))
  .map((value) => {
    if (typeof value === "string") return { value, label: t(value) }
    return { label: "", value: "" };
  });