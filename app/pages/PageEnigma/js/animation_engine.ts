import { AnimationTrackClip } from "../datastructures/clips/animation_track_clip";

export class AnimationEngine {
    clips: { [key: string]: AnimationTrackClip } = {};
    version: number;
    length: number;

    constructor(version: number, length: number) {
        this.clips = {};
        this.version = version;
        this.length = length;
    }

    load_object(object_uuid: string, clip_name: string) {
        this.clips[object_uuid] = new AnimationTrackClip(
            this.version,
            "glb", 
            object_uuid, 
            1.0, 1.0, 
            clip_name);
    }

    play(media_id: string) {
        this.clips[object_uuid].play(media_id);
    }

    stop(media_id: string) {

    }
}

export default AnimationEngine;
