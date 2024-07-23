// Clip offsets represent the state of the clip on the timeline as well as what type of clip it is.
// it is created from a media id.
import { ClipGroup, ClipType, MediaFileType } from "~/pages/PageEnigma/enums";

export interface ClipUiItem {
  version: number;
  type: ClipType;
  group: ClipGroup;
  name: string;
  media_id: string;
  object_uuid: string;
  object_name: string;
  start_offset: number; // in frames
  ending_offset: number; // in frames
  should_play?: boolean;
  clip_uuid: string;
  keyframe_offset: number;
  media_file_type: MediaFileType;
}
export interface ClipUiClassInterface extends ClipUiItem {
  toJSON: () => ClipUiItem;
}

export class ClipUI implements ClipUiClassInterface {
  version: number;
  type: ClipType;
  group: ClipGroup;
  name: string;
  media_id: string;
  object_uuid: string;
  object_name: string;
  start_offset: number; // in frames
  ending_offset: number; // in frames
  should_play: boolean;
  clip_uuid: string;
  keyframe_offset: number;
  media_file_type: MediaFileType;

  constructor({
    version,
    type,
    group,
    name,
    media_id,
    clip_uuid,
    object_uuid,
    object_name,
    start_offset,
    offset,
    ending_offset,
    length,
    keyframe_offset = 0,
    media_file_type,
  }: {
    version: number;
    type: ClipType;
    group: ClipGroup;
    name: string;
    media_id: string;
    clip_uuid: string;
    object_uuid: string;
    object_name: string;
    start_offset?: number;
    offset?: number; // =start_offset, kept for now just for backwards compatibility
    ending_offset?: number;
    length?: number; // =ending_offset, kept for now just for backwards compatibility
    keyframe_offset?: number;
    media_file_type: MediaFileType;
  }) {
    this.version = version;
    this.group = group; // Only needed for UI

    this.clip_uuid = clip_uuid;

    this.name = name; // UI
    this.type = type; // UI and Animation / Audio / Lipsync /  : Engine

    this.object_uuid = object_uuid; // Animation / Audio / Lipsync /  : Engine
    this.object_name = object_name;
    this.media_id = media_id; //  Animation / Audio / Lipsync /  : Engine
    this.start_offset = start_offset ? start_offset : offset ? offset : 0;
    this.ending_offset = ending_offset ? ending_offset : length ? length : 0;

    this.should_play = true;
    this.keyframe_offset = keyframe_offset ?? 0;

    this.media_file_type = media_file_type;
  }

  toJSON(): ClipUiItem {
    return {
      version: this.version,
      group: this.group,
      name: this.name,
      type: this.type,
      clip_uuid: this.clip_uuid,
      object_uuid: this.object_uuid,
      object_name: this.object_name,
      media_id: this.media_id,
      start_offset: this.start_offset,
      ending_offset: this.ending_offset,
      keyframe_offset: this.keyframe_offset,
      media_file_type: this.media_file_type,
    };
  }
}
