import * as THREE from "three";
import { Retarget } from "../retargeting";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { get_media_url } from "~/Classes/ApiHelpers";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
import { ClipUI } from "../../clips/clip_ui";

export class CharacterAnimationEngine {
  version: number;
  characterAnimations: Map<THREE.Object3D<THREE.Object3DEventMap>, ClipUI[]> = new Map();
  characterMixers = new Map<THREE.Object3D<THREE.Object3DEventMap>, THREE.AnimationMixer>();

  constructor(version: number) {
    this.version = version;
  }

  /**
   * A single character model is capable of tracking multiple animations, in its own track
   * These tracks can be blended with weights or additively
   * The weight change can be done via custom interpolation logic
   *
   * @param objectUUID The UUID of the object.
   * @param clip The 3JS animation clip
   * @param clipUI The clip info
   */
  addCharacterAnimation(character: THREE.Object3D, clip: THREE.AnimationClip, clipUI: ClipUI) {
    // If character doesn't exist, create a clip object
    // If it does exist, add a new animation to the existing character by extracting it
    // TODO: FIXME: Duplicate prevention?
    clip.name = clipUI.media_id;
    character.animations.push(clip);
    console.log("Adding animation track:")
    console.log(clip);

    if (!this.characterAnimations.has(character)) {
      this.characterAnimations.set(character, []);
      this.#ensureMixerExists(character);
    }

    // Add the clip info to the character map and sort the clips
    const characterClips = this.characterAnimations.get(character)!;
    characterClips.push(clipUI);
    characterClips.sort((a, b) => a.offset - b.offset);
  }

  /**
   * @param objectUUID The UUID of the object.
   * @param mediaId The media ID of the animation.
   * @param clipUI The clip info
   */
  async addCharacterAnimationMedia(character: THREE.Object3D, mediaId: string, clipUI: ClipUI) {
    // If character doesn't exist, create a clip object
    // If it does exist, add a new animation to the existing character by extracting it
    // TODO: FIXME: Duplicate prevention?
    const animationTrack = await this.#load_animation(character, mediaId);
    this.addCharacterAnimation(character, animationTrack, clipUI);
  }

  #ensureMixerExists(character: THREE.Object3D) {
    if (!this.characterMixers.has(character)) {
      this.characterMixers.set(character, new THREE.AnimationMixer(character));
    }
  }

  getMixer(character: THREE.Object3D) {
    this.#ensureMixerExists(character);
    return this.characterMixers.get(character)!;
  }

  evaluateCharacter(character: THREE.Object3D, timestamp: number) {
    const mixer = this.getMixer(character);
    const clips = this.characterAnimations.get(character)!;

    // Find the clip we're in right now
    const currentClip = clips.find((clip) => {
      return clip.offset <= timestamp && clip.offset + clip.length >= timestamp;
    })

    // If timestamp not in any clip, do nothing.
    // If timestamp in clip, set mixer to the timestamp inside the clip
    // TODO: Interpolate prev and next
    if (!currentClip) {
      return;
    }

    const clipTime = timestamp - currentClip.offset;
    const animationTrack = character.animations.find((clip) => clip.name === currentClip.media_id);

    // NOTE: This shouldn't really happen unless the UI was desynced at some point from the engine
    if (!animationTrack) {
      return;
    }

    const animationAction = mixer.clipAction(animationTrack);
    animationAction.play();
    mixer.setTime(clipTime);
  }

  /** Evaluate all character animations at a given timestamp (milliseconds) */
  evaluate(timestamp: number) {
    console.log("Evaluating character animations at timestamp:", timestamp);
    this.characterMixers.forEach((_, character) => {
      this.evaluateCharacter(character, timestamp);
    })
  }

  stop() {
    this.characterMixers.forEach((mixer) => {
      mixer.stopAllAction();
    });
  }

  async #load_animation(character: THREE.Object3D, mediaId: string): Promise<THREE.AnimationClip> {
    // Get the file URL and extract the (first) animation track from it
    // TODO: Support for multiple animations in a single file?
    const url = await get_media_url(mediaId);

    return await new Promise((resolve) => {
      if (url.includes(".glb")) {
        const glbLoader = new GLTFLoader();

        glbLoader.load(url, (gltf) => {
          const animationClip = gltf.animations[0];
          resolve(animationClip);
        });
      } else if (url.includes(".fbx")) {
        const fbxLoader = new FBXLoader();
        fbxLoader.load(url, (fbx) => {
          const animationClip_1 = fbx.animations[0];
          animationClip_1.tracks.forEach((track) => {
            const retarget = new Retarget();
            const retarget_value = retarget.retarget(track.name);
            track.name = retarget_value.bone;
            console.log(track);
            if (retarget_value.is_special) {
              // TODO: Revisit special properties later
              // this.special_properties.push(retarget_value);
            }
          });
          resolve(animationClip_1);
        });
      } else if (url.includes(".vmd")) {
        const mmdLoader = new MMDLoader();
        mmdLoader.loadAnimation(url, character as THREE.SkinnedMesh, (mmd) => {
          mmd.name = url;
          resolve(mmd as THREE.AnimationClip);
        });
      }
    });
  }

}
