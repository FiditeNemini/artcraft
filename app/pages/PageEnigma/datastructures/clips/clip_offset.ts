export interface ClipOffset {
  version: number;
  type: "transform" | "audio" | "animation";
  clip_uuid: number;
  start_offset: number; // in milliseconds (ms)
}

export class ClipOffset implements ClipOffset {
  version: number;
  type: "transform" | "audio" | "animation";
  clip_uuid: number;
  start_offset: number; // in milliseconds (ms)

  constructor(
    version: number,
    type: "transform" | "audio" | "animation",
    clip_uuid: number,
    start_offset: number,
  ) {
    this.version = version;
    this.type = type;
    this.clip_uuid = clip_uuid;
    this.start_offset = start_offset;
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      type: this.type,
      clip_uuid: this.clip_uuid,
      start_offset: this.start_offset,
    });
  }
}
