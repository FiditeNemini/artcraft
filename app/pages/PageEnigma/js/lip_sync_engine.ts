
import { LipSyncTrackClip  } from "../datastructures/clips/lipsync_track_clip";
import { LipSync } from "./lipsync";
import * as THREE from 'three';

// needs to be apart of the editor window.
export class LipSyncEngine {

    clips: { [key: string]: LipSyncTrackClip } = {}
    audio_sources: { [key: string]: AudioBufferSourceNode } = {}
    version: number

    constructor() {
    
        this.clips = {}
        this.audio_sources = {}
        this.version = 1.0
    }

    load_object(object_uuid: string, audio_media_id: string) {
        this.clips[object_uuid] = new LipSyncTrackClip(this.version, audio_media_id, 1.0);
    }
}

export default LipSyncEngine;
