/// Requests to the "speak" endpoint.
class SpeakRequest {
  text: String
  speaker: String
  reload_model: boolean

  constructor(text: String, speaker: String) {
    this.text = text;
    this.speaker = speaker; 
    this.reload_model = false;
  }

  public setReloadModel(reload: boolean) {
    this.reload_model = reload;
  }
}

export { SpeakRequest };
