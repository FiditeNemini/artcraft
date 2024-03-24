import { faL } from '@fortawesome/pro-solid-svg-icons';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export interface AnimationTrackClip {
  version: number
  media_id: string
  object_uuid: string
  type: "animation"
  location: "glb" | "remote"
  speed: number
  length: number
  clip_name: string
}

export class AnimationTrackClip implements AnimationTrackClip {
  version: number;
  media_id: string; // comes from the server
  object_uuid: string;
  type: "animation";
  location: "glb" | "remote";
  speed: number;
  length: number;
  clip_name: string;
  mixer: THREE.AnimationMixer | undefined;
  animation_clip: THREE.AnimationClip | undefined;
  clip_action: THREE.AnimationAction | undefined;

  constructor(
    version: number,
    media_id: string,
    location: "glb" | "remote",
    object_uuid: string,
    speed: number,
    length: number,
    clip_name: string,
  ) {
    this.version = version;
    this.media_id = media_id;
    this.type = "animation";
    this.object_uuid = object_uuid;
    this.location = location;
    this.speed = speed;
    this.length = length;
    this.clip_name = clip_name;
    this.animation_clip;
    this.mixer;
    this.clip_action;
  }

  // Takes a glb animation loads from the server  
  _load_animation(url: string): Promise<THREE.AnimationClip> {
    return new Promise((resolve) => {
      const glbLoader = new GLTFLoader();

      glbLoader.load(
        url,
        (gltf) => {
          // Assuming the animation is the first one in the animations array
          const animationClip = gltf.animations[0];
          resolve(animationClip);
        },
      );
    });
  }

  _create_mixer(object: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(object);
  }

  async _get_clip() {
    if (this.animation_clip == null) {
      this.animation_clip = await this._load_animation(this.clip_name);
    }
    return this.animation_clip;
  }

  async play(object: THREE.Object3D) {
    if (this.mixer == null) { this._create_mixer(object) }

    let anim_clip = await this._get_clip();
    this.clip_action = this.mixer?.clipAction(anim_clip);
    if (this.clip_action) {
      if (this.clip_action?.isRunning() == false) {
        this.clip_action.play();
      }
    }

  }

  step(deltatime: number) {
    if (this.mixer == null) { return; }
    this.mixer?.update(deltatime);
  }

  stop() {
    this.mixer?.stopAllAction();
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      object_uuid: this.object_uuid,
      type: this.type,
      speed: this.speed,
      length: this.length,
      clip_name: this.clip_name,
    })
  }
}
