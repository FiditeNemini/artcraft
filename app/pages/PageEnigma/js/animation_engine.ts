import { AnimationTrackClip } from "../datastructures/clips/animation_track_clip";
import * as THREE from 'three';

export class AnimationEngine {
    clips: { [key: string]: AnimationTrackClip } = {};
    version: number;
    length: number;

    constructor(version: number, length: number) {
        this.clips = {};
        this.version = version;
        this.length = length;
    }

    load_object(object_uuid: string, media_id:string, clip_name: string) {
        this.clips[object_uuid] = new AnimationTrackClip(
            this.version,
            media_id,
            "glb", 
            object_uuid, 
            1.0, 1.0, 
            clip_name);
    }
}

export default AnimationEngine;
