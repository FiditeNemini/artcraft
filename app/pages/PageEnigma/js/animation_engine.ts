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

    load_clip(media_id: string, object_uuid: string, clip_name: string) {
        this.clips[media_id] = new AnimationTrackClip(this.version, media_id, "glb", object_uuid, 1.0, 1.0, clip_name)
    }

    play(media_id: string) {

    }

    stop(media_id: string) {

    }
}

export default AnimationEngine;
