import { EmotionClip } from "../datastructures/clips/emotion_clip";

class EmotionEngine {
    clips: { [key: string]: EmotionClip } = {};
    audio_sources: { [key: string]: AudioBufferSourceNode } = {};
    version: number;

    constructor(version: number) {
        this.clips = {};
        this.version = version;
    }

    // loads clips into the engine to cache
    loadClip(object_uuid: string, audio_media_id: string) {
        if(this.clips[audio_media_id+object_uuid] != null) { return; }
        this.clips[audio_media_id+object_uuid] = new EmotionClip(this.version, audio_media_id);
    }
}

export default EmotionEngine;
