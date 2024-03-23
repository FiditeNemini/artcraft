import { TransformTrackClip } from "../datastructures/clips/transform_track_clip";


class TransformEngine {
    clips: { [key: string]: TransformTrackClip } = {};
    version: number;
    length: number;

    constructor(version: number, length: number) {
        this.version = version;
        this.length = length;
        this.clips = {};
    }

    loadObject(object_uuid: string) {
        this.clips[object_uuid] = new TransformTrackClip(this.version, object_uuid, length);
    }

    playClip(object_uuid: string) {
        const clip = this.clips[object_uuid];
        if (clip) {
            clip
        } else {
            console.warn(`TransformEngine: TransformClip with id "${object_uuid}" not found.`);
        }
    }

    stopClip(object_uuid: string) {
        const clip = this.clips[object_uuid];
        if (clip) {
            // Disable stepping and reset.
        } else {
            console.warn(`TransformEngine: TransformClip with id "${object_uuid}" not found.`);
        }
    }
}

export default TransformEngine;
