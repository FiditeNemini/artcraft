import { faL } from '@fortawesome/pro-solid-svg-icons';
import * as THREE from 'three';

export interface TransformTrackClip {
  version: number;
  media_id: string;
  type: "transform";
  positions: THREE.Vector3[];
  rotations: THREE.Vector3[];
  scales: THREE.Vector3[];
  length: number;
}

export class TransformTrackClip implements TransformTrackClip {
  version: number;
  media_id: string;
  object_uuid: string;
  type: "transform";
  positions: THREE.Vector3[];
  rotations: THREE.Vector3[];
  scales: THREE.Vector3[];
  length: number;

  step_frame: number;
  looping: boolean;

  constructor(version: number, object_uuid: string, length: number, media_id: string = "") {
    this.version = version;
    this.media_id = media_id;
    this.object_uuid = object_uuid;
    this.type = "transform";

    this.length = length;

    this.positions = [];
    this.rotations = [];
    this.scales = [];

    this.step_frame = 0;
    this.looping = false;
  }

  step(object: THREE.Object3D) {
    if (this.step_frame >= 60/this.length && this.looping == false) { return; } // Reached max frames.
    if(this.positions.length < 2) { return; } // If there are enough points in the scene.
    this.step_frame += 1;
    const curve = new THREE.CatmullRomCurve3(this.positions);
    const point = curve.getPoint((this.step_frame/60)*this.length);
    object.position.copy(point);
  }

  reset(object: THREE.Object3D) {
    if (this.positions.length > 0) {
      let first_pos = this.positions[0];
      object.position.copy(first_pos);
      this.step_frame = 0;
    }
  }

  add_position(position: THREE.Vector3) {
    this.positions.push(new THREE.Vector3(position.x, position.y, position.z));
  }

  remove_position(position: THREE.Vector3) {
    this.positions = this.positions.filter(positions => {
      return !position.equals(position);
    });
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      object_uuid: this.object_uuid,
      length: this.length,
      type: this.type,
      position: this.positions,
      rotation: this.rotations,
      scale: this.scales,
    });
  }
}
