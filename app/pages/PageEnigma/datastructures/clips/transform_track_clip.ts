export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface TransformTrackClip {
  version: number;
  uuid: number;
  media_id: number;
  type: "transform";
  position: Vector3[];
  rotation: Vector3[];
  scale: Vector3[];
}

export class TransformTrackClipClass implements TransformTrackClip {
    version: number;
    uuid: number;
    media_id: number;
    type: "transform";
    position: Vector3[];
    rotation: Vector3[];
    scale: Vector3[];
  
    constructor(version: number, uuid: number, media_id: number, position: Vector3[], rotation: Vector3[], scale: Vector3[]) {
      this.version = version;
      this.uuid = uuid;
      this.media_id = media_id;
      this.type = "transform";
      this.position = position;
      this.rotation = rotation;
      this.scale = scale;
    }
  
    toJSON(): string {
      return JSON.stringify({
        version: this.version,
        uuid: this.uuid,
        media_id: this.media_id,
        type: this.type,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale,
      });
    }
  }
