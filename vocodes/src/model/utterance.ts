import { Speaker } from "../Speakers";

class Utterance {
  static counter: number = 0;

  id: number;
  originalText: string;
  speaker: Speaker;
  howl: Howl;
  base64data: string;

  constructor(originalText: string, speaker: Speaker, howl: Howl, base64data: string) {
    this.id = Utterance.counter++;
    this.originalText = originalText;
    this.speaker = speaker;
    this.howl = howl;
    this.base64data = base64data;
  }
}

export { Utterance }
