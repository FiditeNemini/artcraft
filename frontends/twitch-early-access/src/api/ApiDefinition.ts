/// Requests to the "speak" endpoint.
/// This elides "reload_model" and other "admin-y" things.
class SpeakRequest {
  text: String
  speaker: String

  constructor(text: String, speaker: String) {
    this.text = text;
    this.speaker = speaker; 
  }
}

export { SpeakRequest };
