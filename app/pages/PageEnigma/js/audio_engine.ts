import { AudioTrackClip } from "../datastructures/clips/audio_track_clip";


class AudioEngine {
    clips: { [key: string]: AudioTrackClip } = {};
    audio_sources: { [key: string]: AudioBufferSourceNode } = {};
    version: number;

    constructor() {
        this.clips = {};
        this.audio_sources = {};
        this.version = 1.0;
    }

    loadClip(audio_media_id: string) {
        this.clips[audio_media_id] = new AudioTrackClip(this.version, audio_media_id, 1.0);
    }

    playClip(audio_media_id: string) {
        const clip = this.clips[audio_media_id];
        if (clip.audio_data?.audioContext) {
            clip.audio_data.source = clip.audio_data.audioContext.createBufferSource();
            clip.audio_data.source.buffer = clip.audio_data.audioBuffer;
            clip.audio_data.source.connect(clip.audio_data.audioContext.destination);
            clip.audio_data.source.start();
        } else {
            console.warn(`AudioManager: AudioClip buffer with id "${audio_media_id}" not found.`);
        }
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

export default AudioEngine;
