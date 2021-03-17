import { Speaker } from "./Speaker";
import Howl from 'howler';

class Utterance {
  speaker: Speaker
  text: string
  url: string
  howl: Howl.Howl

  constructor(speaker: Speaker, text: string, url: string, howl: Howl.Howl) {
    this.speaker = speaker;
    this.text = text;
    this.url = url;
    this.howl = howl;
  }
}

export { Utterance }
