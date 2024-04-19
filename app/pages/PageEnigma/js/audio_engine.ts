import { faL } from "@fortawesome/pro-solid-svg-icons";
import { AudioClip } from "../datastructures/clips/audio_clip";

class AudioEngine {
    clips: { [key: string]: AudioClip } = {};
    audio_sources: { [key: string]: AudioBufferSourceNode } = {};
    version: number;
    playing: string[];
    last_frame: number;

    constructor() {
        this.clips = {};
        this.playing = [];
        this.audio_sources = {};
        this.version = 1.0;
        this.last_frame = 0;
    }

    // loads clips into the engine to cache
    loadClip(audio_media_id: string) {
        if(this.clips[audio_media_id] != null) { return; }
        this.clips[audio_media_id] = new AudioClip(this.version, audio_media_id, 1.0);
    }

    // plays from the timeline.
    playClip(audio_media_id: string, frame: number, offset: number) {
        if (this.clips[audio_media_id] == null) { this.loadClip(audio_media_id); }
        let clip = this.clips[audio_media_id];
        if (clip.audio_data?.audioContext) {

            const frameBuffer = 60;

            if(Math.abs(this.last_frame-frame) < frameBuffer-1 && this.last_frame !== 0) { return; }

            const startTime = (frame-offset) / 60.0;
            const endTime = frameBuffer / 60.0;
            clip.audio_data.source = clip.audio_data.audioContext.createBufferSource();
            clip.audio_data.source.buffer = clip.audio_data.audioBuffer;
            clip.audio_data.source.connect(clip.audio_data.audioContext.destination);
            var sampleRate = clip.audio_data.audioBuffer.sampleRate;  // Get the sample rate from the buffer
            clip.audio_data.source.start(0, startTime, endTime);
            this.last_frame = frame;
            
        } else {
            console.warn(`AudioManager: AudioClip buffer with id "${audio_media_id}" not found.`);
        }
    }

    // stops the clips
    stopClip(audio_media_id: string) {
        const clip = this.clips[audio_media_id];
        if (clip.audio_data?.source) {
            clip.audio_data.source.stop();
            clip.audio_data.source.disconnect();
        } else {
            console.warn(`AudioManager: AudioClip with id "${audio_media_id}" not found.`);
        }
    }
}

export default AudioEngine;
