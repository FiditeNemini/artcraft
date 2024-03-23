export interface AudioTrackClip {
  version: number;
  uuid: number;
  media_id: number;
  type: "audio";
  volume: number;
}

export class AudioTrackClipClass implements AudioTrackClip {
  version: number;
  uuid: number;
  media_id: number;
  type: "audio";
  volume: number;

  constructor(version: number, uuid: number, media_id: number, volume: number) {
    this.version = version;
    this.uuid = uuid;
    this.media_id = media_id;
    this.type = "audio";
    this.volume = volume;
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      uuid: this.uuid,
      media_id: this.media_id,
      type: this.type,
      volume: this.volume,
    });
  }
}
