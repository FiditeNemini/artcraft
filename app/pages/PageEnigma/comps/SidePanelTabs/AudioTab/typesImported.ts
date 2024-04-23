export enum WeightCategory {
  TTS = "text_to_speech",
  VOCODER = "vocoder",
  VC = "voice_conversion",
  ZS = "zero_shot",
  SD = "image_generation",
  WF = "workflow_config",
}

export enum MediaFileClass {
  /// Unknown (default value)
 /// This will be present until we migrate all old files.
 Unknown = "unknown",

 /// Audio files: wav, mp3, etc.
 Audio = "audio",

 /// Image files: png, jpeg, etc.
 Image = "image",

 /// Video files: mp4, etc.
 Video = "video",

 /// Engine "animations"
 Animation = "animation",

 /// Engine "characters"
 Character = "character",

 /// Engine "prop" items
 Prop = "prop",

 /// Engine scenes (internal and external scenes)
 Scene = "scene",
}


export enum MediaFileType {
  Audio = "audio",
  Video = "video",
  Image = "image",

  // BVH is a very popular file format for motion capture.
  // It is compatible with our engine.
  BVH = "bvh",

  // GLTF is the text-based format of GLB. Unforunately it requires a
  // second file to include the visual data, so we strongly discourage
  // the use of this format in favor of GLB.
  GLTF = "gltf",

  // GLB is the format we convert FBX files into. It's a very popular
  // open source 3D file format.
  GLB = "glb",

  // FBX isn't supported by Storyteller Engine, but we can get
  // uploads in this format. It's a very popular 3D graphics format.
  FBX = "fbx",

  // Full Storyteller Engine scenes (RON = Rusty Object Notation)
  // This is a temporary format that will eventually go away.
  SceneRon = "scene_ron",

  None = "none",
}


export enum MediaFileSubtype {
  /// Animation file from Mixamo
  /// Primarily used for FBX and GLB.
  Mixamo = "mixamo",

  /// Animation file from MocapNet
  /// Primarily used for BVH.
  MocapNet = "mocap_net",

  /// Generic animation case
  /// Used for BVH files, but can also pertain to animation-only files of other types.
  AnimationOnly = "animation_only",

  // TODO(bt,2024-03-08): Migrate records and code, then remove
  /// DEPRECATED: Use `SceneImport` instead.
  Scene = "scene",

  /// Generic 3D scene file.
  /// Can pertain to glTF, glB, FBX, etc.
  SceneImport = "scene_import",

  /// Native Storyteller scene format.
  /// Typically stored in a `.scn.ron` file.
  StorytellerScene = "storyteller_scene",
}

/// A common type returned by several endpoints.
/// Basic information to display a user and their avatar.
export interface UserDetailsLight {
  user_token: string,
  /// Username (lowercase)
  username: string,
  /// Username with user-specified capitalization
  display_name: string,
  gravatar_hash: string,
  default_avatar: DefaultAvatarInfo,

}

export interface DefaultAvatarInfo {
  image_index: number,
  color_index: number,
}


export enum WeightType {
  TT2 = "tt2",
  HIFIGAN_TT2 = "hifigan_tt2",
  RVCv2 = "rvc_v2",
  SD_15 = "sd_1.5",
  SDXL = "sdxl",
  SVC = "so_vits_svc",
  LORA = "loRA",
  VALL_E = "vall_e",
  NONE = "none",
}

export interface MediaFile {
  token: string;
  media_type: MediaFileType;
  media_class: MediaFileClass | null;
  maybe_media_subtype: MediaFileSubtype | null;
  public_bucket_path: string;
  maybe_engine_extension: string | null;
  maybe_batch_token: string;
  maybe_title: string | null;
  maybe_original_filename: string | null;
  maybe_creator_user: UserDetailsLight | null;
  maybe_prompt_token: string | null;
  creator_set_visibility: string;
  created_at: Date;
  updated_at: Date;
  maybe_model_weight_info: {
    title: string;
    weight_token: string;
    weight_category: WeightCategory;
    weight_type: WeightType;
    maybe_weight_creator: UserDetailsLight;
    maybe_cover_image_public_bucket_path: string;
  };
}

export interface GetMediaFileResponse {
  success: boolean;
  media_file?: MediaFile;
}

export interface VoiceConversionModelListItem {
  token: string,
  model_type: string,
  title: string,

  creator: CreatorDetails,
  creator_set_visibility: string,

  ietf_language_tag: string,
  ietf_primary_language_subtag: string,
  is_front_page_featured: boolean,

  created_at: string,
  updated_at: string,
}

export interface CreatorDetails {
  user_token: string,
  username: string,
  display_name: string,
  gravatar_hash: string,
}

export interface VoiceConversionModelListResponse {
  success: boolean,
  models: Array<VoiceConversionModelListItem>,
}