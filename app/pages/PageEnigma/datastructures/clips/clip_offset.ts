export interface ClipOffset {
  version: number;
  type: "transform" | "audio" | "animation";
  media_id: number;
  start_offset: number; // in milliseconds (ms)
}

export class ClipOffset implements ClipOffset {
  version: number;
  type: "transform" | "audio" | "animation";
  media_id: number;
  start_offset: number; // in milliseconds (ms)

  constructor(
    version: number,
    type: "transform" | "audio" | "animation",
    media_id: number,
    start_offset: number,
  ) {
    this.version = version;
    this.type = type;
    this.media_id = media_id;
    this.start_offset = start_offset;
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      type: this.type,
      media_id: this.media_id,
      start_offset: this.start_offset,
    });
  }
}
