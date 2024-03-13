import { enumToKeyArr } from "resources";

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
  engine_asset
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

export enum EntityType {
  unknown,
  media,
  weights
}

export enum EngineTypes {
  bvh,
  fbx,
  glb,
  gltf,
  obj,
  ron
}

export enum AudioTypes {
  mp3,
  wav
}

export enum ImageTypes {
  jpg,
  png
}

export enum VideoTypes {
  mp4,
}

export type EntityModeProp = keyof typeof EntityInputMode;
export type MediaFilterProp = keyof typeof MediaFilters;
export type WeightFilterProp = keyof typeof WeightsFilters;
export type EngineFilterProp = keyof typeof EngineTypes;
export type AudioFilterProp = keyof typeof AudioTypes;
export type ImageFilterProp = keyof typeof ImageTypes;
export type VideoFilterProp = keyof typeof VideoTypes;
export type WeightCategoriesProp = keyof typeof WeightsCategories;
export type AcceptTypes = EngineFilterProp | AudioFilterProp | ImageFilterProp | VideoFilterProp | WeightFilterProp;
export type JobSelection = WeightCategoriesProp | WeightFilterProp;

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

export const isSelectedType = (mode: MediaFilters, fileExtension: string) => enumToKeyArr([
  { ...AudioTypes, ...ImageTypes, ...VideoTypes, ...EngineTypes },
  AudioTypes,
  ImageTypes,
  VideoTypes,
  EngineTypes
][mode]).includes(fileExtension);

export const getMediaCategory = (fileExtension: string) => {
  console.log("🍔",isSelectedType(MediaFilters.image,fileExtension));
  isSelectedType(MediaFilters.image,fileExtension);
  if (isSelectedType(MediaFilters.engine_asset, fileExtension)) return MediaFilters.engine_asset;
  if (isSelectedType(MediaFilters.audio, fileExtension)) return MediaFilters.audio;
  if (isSelectedType(MediaFilters.image, fileExtension)) return MediaFilters.image;
  if (isSelectedType(MediaFilters.video, fileExtension)) return MediaFilters.video;
  return MediaFilters.all; // will change to "unknown" eventually
}




