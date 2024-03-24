
import { LipSyncTrackClip  } from "../datastructures/clips/lipsync_track_clip";
import { LipSync } from "./lipsync";
import * as THREE from 'three';

// needs to be apart of the editor window.
export class LipSyncEngine {

    clips: { [key: string]: LipSyncTrackClip } = {}
    audio_sources: { [key: string]: AudioBufferSourceNode } = {}
    version: number
    lipsync: LipSync

    constructor() {
    
        this.clips = {}
        this.audio_sources = {}
        this.version = 1.0
        // we might need 3 of these one for each character ...
        this.lipsync = new LipSync()
    }

    loadClip(audio_media_id: string) {
        this.clips[audio_media_id] = new LipSyncTrackClip(this.version, audio_media_id, 1.0);
    }

    // needs to be called by the engine.
    update() {
        this.lipsync.update()
    }

    playClip(face: THREE.Object3D,audio_media_id: string) {
        // face movement here
        this.lipsync.face = face
        const clip = this.clips[audio_media_id];
        // this is a buffer right?
        this.lipsync.startLipSyncFromAudioBuffer(clip)
    }

    stopClip(audio_media_id: string) {
        const clip = this.clips[audio_media_id];
        if (clip.audio_data?.source) {
            clip.audio_data.source.stop();
        } else {
            console.warn(`AudioManager: AudioClip with id "${audio_media_id}" not found.`);
        }
    }
}

export default LipSyncEngine;
