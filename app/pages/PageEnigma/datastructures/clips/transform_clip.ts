import * as THREE from 'three';

export class TransformFrame {
  position: THREE.Vector3
  rotation: THREE.Vector3
  scale: THREE.Vector3
  offset: number

  constructor(position: THREE.Vector3, rotation: THREE.Vector3, scale: THREE.Vector3, offset: number) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.offset = offset;
  }
}

export class TransformClip {
  version: number;
  media_id: string;
  object_uuid: string;
  type: "transform";
  keyframes: TransformFrame[];
  length: number;

  step_frame: number;
  looping: boolean;

  constructor(version: number, object_uuid: string, length: number, media_id: string = "") {
    this.version = version;
    this.media_id = media_id;
    this.object_uuid = object_uuid;
    this.type = "transform";

    this.length = length;

    this.keyframes = [];

    this.step_frame = 0;
    this.looping = false;
  }

  private findNextNumber(location: number) {
    // Sort the transform frames based on their offset in ascending order
    this.keyframes.sort((a, b) => a.offset - b.offset);

    let currentKeyframe: TransformFrame | undefined;
    let nextKeyframe: TransformFrame | undefined;

    for (let frame of this.keyframes) {
      if (frame.offset <= location) {
        currentKeyframe = frame;
      } else if (frame.offset > location) {
        nextKeyframe = frame;
        break;
      }
    }

    return { currentKeyframe, nextKeyframe };
  }

  step(object: THREE.Object3D, offset: number, frame: number) {
    this.step_frame = frame - offset;
    //if (this.step_frame < 0) { this.step_frame = 0; }
    //if (this.step_frame >= this.length) { return; } // Reached max frames.
    if (this.keyframes.length < 2) { return; } // If there are enough points in the scene.

    // Find the current and next keyframes based on time_frame
    let { currentKeyframe, nextKeyframe } = this.findNextNumber(this.step_frame);

    if (nextKeyframe != undefined && currentKeyframe != undefined) {

      let small_step_frame = this.step_frame-currentKeyframe.offset;
      console.log(frame, currentKeyframe?.offset, nextKeyframe?.offset);
      //console.log(currentKeyframe?.position, nextKeyframe?.position);
      let location = (small_step_frame / (nextKeyframe.offset - currentKeyframe.offset));
      if (location < 0) {
        location = 0;
      }
      let pos_s = currentKeyframe?.position;
      let pos_e = nextKeyframe?.position;
      let points = [new THREE.Vector3(pos_s.x, pos_s.y, pos_s.z), new THREE.Vector3(pos_e.x, pos_e.y, pos_e.z)]
      let curve = new THREE.CatmullRomCurve3(points);
      let point = curve.getPoint(location);
      if (location < 1) {
        object.position.copy(point);
      }
    }

    //let curve_rot = new THREE.CatmullRomCurve3(this.rotations);
    //let point_rot = curve_rot.getPoint(time_frame);
    //object.rotation.set(point_rot.x, point_rot.y, point_rot.z);
    //let curve_scale = new THREE.CatmullRomCurve3(this.scales);
    //let point_scale = curve_scale.getPoint(time_frame);
    //object.scale.copy(point_scale);
  }

  reset(object: THREE.Object3D) {
    if (this.keyframes.length > 0) {
      let first_pos = this.keyframes[0].position;
      let first_rot = this.keyframes[0].rotation;
      let first_scl = this.keyframes[0].scale;
      object.position.copy(first_pos);
      object.rotation.set(first_rot.x, first_rot.y, first_rot.z);
      object.scale.copy(first_scl);
      this.step_frame = 0;
    }
  }

  add_frame(position: THREE.Vector3, rotation: THREE.Vector3, scale: THREE.Vector3, offset: number) {
    this.keyframes.push(new TransformFrame(
      position,
      rotation,
      scale,
      offset));
  }

  toJSON(): string {
    return JSON.stringify({
      version: this.version,
      media_id: this.media_id,
      object_uuid: this.object_uuid,
      length: this.length,
      type: this.type,
      keyframes: this.keyframes,
    });
  }
}
