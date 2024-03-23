import * as THREE from 'three';

export interface TransformTrackClip {
  version: number;
  media_id: number;
  type: "transform";
  position: THREE.Vector3[];
  rotation: THREE.Vector3[];
  scale: THREE.Vector3[];
}

export class TransformTrackClipClass implements TransformTrackClip {
    version: number;
    media_id: number;
    type: "transform";
    position: THREE.Vector3[];
    rotation: THREE.Vector3[];
    scale: THREE.Vector3[];
  
    constructor(version: number, media_id: number, position: THREE.Vector3[], rotation: THREE.Vector3[], scale: THREE.Vector3[]) {
      this.version = version;
      this.media_id = media_id;
      this.type = "transform";
      this.position = position;
      this.rotation = rotation;
      this.scale = scale;
    }

    add_position(position: THREE.Vector3) {
      this.position.push(position);
    }

    remove_position(position: THREE.Vector3) {
      this.position = this.position.filter(position => {
        return !position.equals(position);
      });
    }
  
    toJSON(): string {
      return JSON.stringify({
        version: this.version,
        media_id: this.media_id,
        type: this.type,
        position: this.position,
        rotation: this.rotation,
        scale: this.scale,
      });
    }
  }
