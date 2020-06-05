/// Requests to the "speak" endpoint.
class SpeakRequest {
  text: String
  speaker: String

  constructor(text: String, speaker: String) {
    this.text = text;
    this.speaker = speaker; 
  }
}

export { SpeakRequest };
