import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AnimationClip  {
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
    return this.mixer;
  }

  async _get_clip() {
    if (this.animation_clip == null) {
      this.animation_clip = await this._load_animation(this.media_id);
    }
    return this.animation_clip;
  }

  async play(object: THREE.Object3D) {
    if (this.mixer == null) {
      this.mixer = this._create_mixer(object);
      let anim_clip = await this._get_clip();
      this.clip_action = this.mixer?.clipAction(anim_clip);
      if (this.clip_action) {
        if (this.clip_action?.isRunning() == false) {
          this.clip_action.play();
        }
      }
      console.log("Play")
    }
  }

  step(deltatime: number) {
    if (this.mixer == null) { return; }
    this.mixer?.update(deltatime);
    console.log("Update")
  }

  stop() {
    this.mixer?.stopAllAction();
    console.log("stop.")
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
