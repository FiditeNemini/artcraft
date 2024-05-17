import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/Addons.js";

import { MoveAIResult, Retarget } from "../../js/retargeting";
import { environmentVariables } from "~/signals";

export class AnimationClip {
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
  special_properties: MoveAIResult[];
  retargeted: boolean;
  last_frame: number;

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
    this.special_properties = [];
    this.retargeted = false;
    this.last_frame = 0;
  }

  async get_media_url() {
    //This is for prod when we have the proper info on the url.
    const api_base_url = environmentVariables.value.BASE_API;
    const url = `${api_base_url}/v1/media_files/file/${this.media_id}`;

    console.log(`API BASE URL? ${api_base_url}`);
    console.log(`CALLED URL? ${url}`);

    const response = await fetch(url);
    const json = await JSON.parse(await response.text());
    const bucketPath = json["media_file"]["public_bucket_path"];
    const media_base_url = "https://storage.googleapis.com/vocodes-public";
    const media_url = `${media_base_url}${bucketPath}`;
    return media_url;
  }

  _load_animation(): Promise<THREE.AnimationClip> {
    // Return the promise chain starting from `this.get_media_url()`
    return this.get_media_url().then((url) => {
      // Return a new Promise that resolves with the animation clip
      return new Promise((resolve) => {
        if (url.includes(".glb")) {
          const glbLoader = new GLTFLoader();

          glbLoader.load(url, (gltf) => {
            // Assuming the animation is the first one in the animations array
            const animationClip = gltf.animations[0];
            resolve(animationClip);
          });
        } else if (url.includes(".fbx")) {
          const fbxLoader = new FBXLoader();
          fbxLoader.load(url, (fbx) => {
            let animationClip = fbx.animations[0];
            this.retargeted = true;
            animationClip.tracks.forEach((track) => {
              const retarget = new Retarget();
              const retarget_value = retarget.retarget(track.name);
              track.name = retarget_value.bone;
              console.log(track);
              if (retarget_value.is_special) {
                this.special_properties.push(retarget_value);
              }
            });
            resolve(animationClip);
          });
        } else {
          console.log("Could not animation type.");
        }
      });
    });
  }

  _create_mixer(object: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(object);
    return this.mixer;
  }

  async _get_clip() {
    if (this.animation_clip == null && this.mixer !== null) {
      this.animation_clip = await this._load_animation();
    }
    return this.animation_clip;
  }

  async play(object: THREE.Object3D) {
    if (this.mixer == null) {
      this.mixer = this._create_mixer(object);
      const anim_clip = await this._get_clip();
      if (anim_clip == undefined) {
        return;
      }
      this.clip_action = this.mixer?.clipAction(anim_clip);
      if (this.clip_action) {
        if (this.clip_action?.isRunning() == false) {
          this.clip_action.play();
        }
      }
    }
  }

  update_bones() {
    if (this.retargeted === false) {
      return;
    }
    let rootObject = this.mixer?.getRoot();
    if (rootObject)
      for (
        let index_ = 0;
        index_ <
        (rootObject as THREE.Object3D<THREE.Object3DEventMap>).children.length;
        index_++
      ) {
        const child_holder = (
          rootObject as THREE.Object3D<THREE.Object3DEventMap>
        ).children[index_];
        if (child_holder.type == "Bone") {
          child_holder.traverse(
            (bone: THREE.Object3D<THREE.Object3DEventMap>) => {
              for (
                let index__ = 0;
                index__ < this.special_properties.length;
                index__++
              ) {
                const property = this.special_properties[index__];
                if (property.bone == bone.name + ".quaternion") {
                  let quat_y = THREE.MathUtils.degToRad(property.y);
                  bone.rotateY(quat_y);
                  if (property.only_y == false) {
                    let quat_x = THREE.MathUtils.degToRad(property.x);
                    bone.rotateX(quat_x);
                    let quat_z = THREE.MathUtils.degToRad(property.z);
                    bone.rotateZ(quat_z);
                  } else {
                    if (child_holder.parent) {
                      child_holder.parent.rotation.x =
                        THREE.MathUtils.degToRad(-90);
                    }
                  }

                  if (property.flip) {
                    bone.rotateX(bone.rotation.x * 2 * -1);
                  }
                } else if (property.bone == bone.name + ".position") {
                  bone.position.set(
                    bone.position.x * property.x,
                    bone.position.y * property.y,
                    bone.position.z * property.z,
                  );
                }
              }
            },
          );
        }
      }
  }

  animate(deltatime: number) {
    this.mixer?.setTime(deltatime);
    this.update_bones();
  }

  async step(deltatime: number, isPlaying: boolean, frame: number) {
    if (this.mixer == null) {
      return;
    }
    if (this.retargeted) {
      if (isPlaying || Math.floor(frame) != this.last_frame) {
        if (Math.floor(frame) != 0) {
          this.animate(deltatime);
        }
      }
    } else {
      this.animate(deltatime);
    }
    this.last_frame = frame;
  }

  stop() {
    this.mixer?.setTime(0);
  }

  toJSON(): any {
    return {
      version: this.version,
      media_id: this.media_id,
      object_uuid: this.object_uuid,
      type: this.type,
      speed: this.speed,
      length: this.length,
      clip_name: this.clip_name,
    };
  }
}
