import { GetFileExtension } from "./GetFileExtension";

// We only list supported file types
export enum FileType {
  // Audio
  Mp3 = "mp3",
  Wav = "wav",

  // Images
  Jpg = "jpg",
  Png = "png",

  // Video
  Mp4 = "mp4",

  // 3D
  Bvh = "bvh",
  Fbx = "fbx",
  Glb = "glb",
  Gltf = "gltf",
  Obj = "obj",
  Ron = "ron",
  Pmd = "pmd",
  Vmd = "vmd",

  // Unknown or unsupported
  Unknown = "unknown",
}

const FILE_TYPE_MAP : Record<string, FileType> = {
  "bvh": FileType.Bvh,
  "fbx": FileType.Fbx,
  "glb": FileType.Glb,
  "gltf": FileType.Gltf,
  "jpg": FileType.Jpg,
  "mp3": FileType.Mp3,
  "mp4": FileType.Mp4,
  "obj": FileType.Obj,
  "png": FileType.Png,
  "ron": FileType.Ron,
  "wav": FileType.Wav,
  "pmd": FileType.Pmd,
  "vmd": FileType.Vmd,
}

export function GetFileTypeByExtension(filename: string) : FileType {
  const extension = GetFileExtension(filename).toLocaleLowerCase();
  return FILE_TYPE_MAP[extension] || FileType.Unknown;
}
