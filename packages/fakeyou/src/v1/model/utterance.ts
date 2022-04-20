import { Speaker } from "./Speakers";
import { Howl } from 'howler';

class Utterance {
  static counter: number = 0;

  id: number;
  originalText: string;
  speaker: Speaker;
  howl: Howl;
  base64data?: string;
  audioUrl?: string

  constructor(originalText: string, speaker: Speaker, howl: Howl, base64data?: string, audioUrl?: string) {
    this.id = Utterance.counter++;
    this.originalText = originalText;
    this.speaker = speaker;
    this.howl = howl;
    this.base64data = base64data;
    this.audioUrl = audioUrl;
  }

  public getUrl(): string {
    if (this.audioUrl !== undefined) {
      return this.audioUrl;
    }
    return `data:audio/wav;base64,${this.base64data}`;
  }
}

export { Utterance }
