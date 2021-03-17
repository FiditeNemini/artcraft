import { Speaker } from "./Speaker";

class Utterance {
  speaker: Speaker
  text: string

  constructor(speaker: Speaker, text: string) {
    this.speaker = speaker;
    this.text = text;
  }
}

export { Utterance }
