export interface ClipUI {
  version: number
  type: "transform" | "audio" | "animation"
  media_id: string
  object_uuid: string
  start_offset: number // in frames so 60 frames per second on the timeline.
  ending_offset: number // ending offset
}

// Clip offsets represent the state of the clip on the timeline as well as what type of clip it is.
// it is created from a media id.
export class ClipUI implements ClipUI {
  version: number
  type: "transform" | "audio" | "animation"
  media_id: string
  object_uuid: string
  start_offset: number // in frames
  ending_offset: number  // in frames

  constructor(
    version: number,
    type: "transform" | "audio" | "animation",
    media_id: string,
    object_uuid: string,
    start_offset: number,
    ending_offset: number,
  ) {
    this.version = version
    this.type = type
    this.object_uuid = object_uuid
    this.media_id = media_id
    this.start_offset = start_offset
    this.ending_offset = ending_offset
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      object_uuid: this.object_uuid,
      type: this.type,
      media_id: this.media_id,
      start_offset: this.start_offset,
      ending_offset: this.ending_offset
    })
  }
}
