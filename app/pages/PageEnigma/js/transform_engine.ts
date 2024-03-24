import { TransformTrackClip } from "../datastructures/clips/transform_track_clip";
import * as THREE from 'three';

class TransformEngine {
    clips: { [key: string]: TransformTrackClip } = {};
    version: number;
    length: number;

    constructor(version: number, length: number) {
        this.version = version;
        this.length = length;
        this.clips = {};
    }

    loadObject(object_uuid: string, clip_length:number = 2) {
        this.clips[object_uuid] = new TransformTrackClip(this.version, object_uuid, clip_length);
    }

    addFrame(object: THREE.Object3D, clip_length:number = 2) {
        if(this.clips[object.uuid] == null) {
            this.clips[object.uuid] = new TransformTrackClip(this.version, object.uuid, clip_length);
        }
        this.clips[object.uuid].add_position(object.position);
    }
}

export default TransformEngine;
