// Clip offsets represent the state of the clip on the timeline as well as what type of clip it is.
// it is created from a media id.
import { ClipGroup, ClipType } from "~/pages/PageEnigma/models";

export class ClipUI {
  version: number;
  type: ClipType;
  group: ClipGroup;
  name: string;
  media_id: string;
  object_uuid: string;
  offset: number; // in frames
  length: number; // in frames

  constructor(
    version: number,
    type: ClipType,
    group: ClipGroup,
    name: string,
    media_id: string,
    object_uuid: string,
    offset: number,
    length: number,
  ) {
    this.version = version;
    this.group = group; // Only needed for UI

    this.name = name; // UI
    this.type = type; // UI and Animation / Audio / Lipsync /  : Engine

    this.object_uuid = object_uuid; // Animation / Audio / Lipsync /  : Engine
    this.media_id = media_id; //  Animation / Audio / Lipsync /  : Engine
    this.offset = offset;
    this.length = length;
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      group: this.group,
      name: this.name,
      type: this.type,
      object_uuid: this.object_uuid,
      media_id: this.media_id,
      start_offset: this.offset,
      ending_offset: this.length,
    });
  }
}
