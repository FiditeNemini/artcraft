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
    let curve = new THREE.CatmullRomCurve3(this.positions);
    let point = curve.getPoint((this.step_frame/60)*this.length);
    object.position.copy(point);

    let curve_rot = new THREE.CatmullRomCurve3(this.rotations);
    let point_rot = curve.getPoint((this.step_frame/60)*this.length);
    object.rotation.set(point_rot.x, point_rot.y, point_rot.z);

    let curve_scale = new THREE.CatmullRomCurve3(this.scales);
    let point_scale = curve.getPoint((this.step_frame/60)*this.length);
    object.position.copy(point_scale);
  }

  reset(object: THREE.Object3D) {
    if (this.positions.length > 0) {
      let first_pos = this.positions[0];
      let first_rot = this.rotations[0];
      let first_scl = this.scales[0];
      object.position.copy(first_pos);
      object.rotation.set(first_rot.x, first_rot.y, first_rot.z);
      object.scale.copy(first_scl);
      
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

  add_rotation(rotation: THREE.Vector3) {
    this.rotations.push(new THREE.Vector3(rotation.x, rotation.y, rotation.z));
  }

  remove_rotation(rotation: THREE.Vector3) {
    this.rotations = this.rotations.filter(rotations => {
      return !rotation.equals(rotation);
    });
  }

  add_scale(scale: THREE.Vector3) {
    this.scales.push(new THREE.Vector3(scale.x, scale.y, scale.z));
  }

  remove_scale(scale: THREE.Vector3) {
    this.scales = this.scales.filter(scales => {
      return !scale.equals(scale);
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
