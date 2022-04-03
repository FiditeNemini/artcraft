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

/// This is the speaker response.
/// From the `/speak` endpoint.
class SpeakerResponse {
  speakers?: SpeakerDetails[]
}

class SpeakerDetails {
  name?: string
  slug?: string
  model_pipeline?: string
  tacotron?: string
  melgan?: string
}

export { SpeakRequest, SpeakerResponse, SpeakerDetails};
