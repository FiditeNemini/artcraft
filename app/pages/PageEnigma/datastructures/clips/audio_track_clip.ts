export interface AudioTrackClip {
  version: number;
  media_id: string;
  type: "audio";
  volume: number;
}

export class AudioTrackClip implements AudioTrackClip {
  version: number;
  media_id: string;
  type: "audio" = "audio";
  volume: number;
  buffer: AudioBufferSourceNode | undefined;

  constructor(version: number, media_id: string, volume: number) {
    this.version = version;
    this.media_id = media_id;
    this.type = "audio";
    this.volume = volume;
    this.download_audio().then(data => {
      this.buffer = data;
    });
  }

  get_media_url() {
    // This is for prod when we have the proper info on the url.
    // let baseUrl = "https://api.fakeyou.com";
    // let url = `${baseUrl}/media/${this.media_id}`
    // return url;

    return "/resources/sound/2pac.wav";
  }

  async download_audio() {
    let new_audio_context = new AudioContext();
    let url = this.get_media_url();
    const audioContext = new AudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    return source;
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
