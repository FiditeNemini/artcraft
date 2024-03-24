import { LipSync } from "../../js/lipsync";
import * as THREE from 'three';
interface AudioData {
    audioContext: AudioContext;
    audioBuffer: AudioBuffer;
  }
  
  class AudioData implements AudioData{
    audioContext: AudioContext;
    audioBuffer: AudioBuffer;
    source: AudioBufferSourceNode | undefined
  
    constructor (audioContext: AudioContext, audioBuffer: AudioBuffer) {
      this.audioContext = audioContext;
      this.audioBuffer = audioBuffer;
    }
  }
  
  export interface LipSyncTrackClip {
    version: number;
    media_id: string;
    type: "lipsync";
    volume: number;
  }
  
  export class LipSyncTrackClip implements LipSyncTrackClip {
    version: number;
    media_id: string;
    type: "lipsync" = "lipsync";
    volume: number;
    audio_data: AudioData | undefined;
    lipsync: LipSync;
  
    constructor(version: number, media_id: string, volume: number) {
      this.version = version;
      this.media_id = media_id;
      this.type = "lipsync";
      this.volume = volume;
      this.download_audio().then(data => {
        this.audio_data = data;
      });

      // we might need 3 of these one for each character ...
      this.lipsync = new LipSync()
    }
    
    // lip sync will be generated through TTS 
    async get_media_url() {
      //This is for prod when we have the proper info on the url.
      let api_base_url = "https://api.fakeyou.com";
      let url = `${api_base_url}/v1/media_files/file/${this.media_id}`
      let responce = await fetch(url);
      let json = await JSON.parse(await responce.text());
      let bucketPath = json["media_file"]["public_bucket_path"];
      let media_base_url = "https://storage.googleapis.com/vocodes-public"
      let media_url = `${media_base_url}${bucketPath}`
      return media_url;
    }
  
    async download_audio() {
      let url = await this.get_media_url();
      const audioContext = new AudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return new AudioData(audioContext, audioBuffer);
    }

    play(face: THREE.Object3D) {
      if (this.audio_data?.audioBuffer == null) { this.download_audio(); }
      this.lipsync = new LipSync()
      this.lipsync.face = face;
      this.lipsync.startLipSyncFromAudioBuffer(this.audio_data?.audioBuffer);
    }

    stop() {
      if(this.lipsync == null) { return; }
      this.lipsync.destroy();
    }

    step() {
      if(this.lipsync == null) { return; }
      this.lipsync.update();
    }

    reset() {
      this.lipsync = new LipSync()
    }
  
    toJSON(): string {
      return JSON.stringify({
        version: this.version,
        media_id: this.media_id,
        type: this.type,
        volume: this.volume,
      });
    }
  }
  