import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

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
  type: "transform";
  positions: THREE.Vector3[];
  rotations: THREE.Vector3[];
  scales: THREE.Vector3[];
  length: number;

  current_pos: THREE.Vector3;

  playing: boolean;

  constructor(version: number, media_id: string, length: number) {
    this.version = version;
    this.media_id = media_id;
    this.type = "transform";

    this.length = length;

    this.positions = [];
    this.rotations = [];
    this.scales = [];

    this.playing = false;

    this.current_pos = new THREE.Vector3(0, 0, 0);
  }

  update(object: THREE.Object3D) {
    if (this.playing) {
      this.tweenPositions();
      object.position.set(this.current_pos.x, this.current_pos.y, this.current_pos.z);
    }
  }

  reset(object: THREE.Object3D) {
    if (this.positions.length > 0) {
      let first_pos = this.positions[0];
      object.position.set(first_pos.x, first_pos.y, first_pos.z);
    }
  }

  add_position(position: THREE.Vector3) {
    this.positions.push(position);
  }

  remove_position(position: THREE.Vector3) {
    this.positions = this.positions.filter(positions => {
      return !position.equals(position);
    });
  }

  tweenPositions() {
    const tweenDuration = this.length / this.positions.length;

    this.positions.reduce((prevPosition, currentPosition, index) => {
      const tween = new TWEEN.Tween(prevPosition)
        .to({ x: currentPosition.x, y: currentPosition.y, z: currentPosition.z }, tweenDuration)
        .onUpdate(() => {
          this.current_pos = new THREE.Vector3(prevPosition.x, prevPosition.y, prevPosition.z);
        });
      return currentPosition;
    }, this.current_pos.clone());
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      type: this.type,
      position: this.positions,
      rotation: this.rotations,
      scale: this.scales,
    });
  }
}
