import Howl from 'howler';

/// Requests to the backend.
class TtsRequest {
  text: String
  speaker: String

  // Which model to use
  melgan_model?: Number
  arpabet_tacotron_model?: Number

  constructor(text: String) {
    this.text = text;
    // LJSpeech dataset from Keith Ito & LibriVox, spoken by Linda Johnson.
    this.speaker = 'linda'; 
  }
}

class TtsResponse {
  text: string
  howl: Howl

  constructor(text: string, howl: Howl) {
    this.text = text;
    this.howl = howl;
  }
}

let makeTtsRequest = (sentence: string): Promise<TtsResponse> => {
  const request = new TtsRequest(sentence);
  const url = `http://localhost:12345/advanced_tts`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const howlSound = new Howl.Howl({
      src: [url],
      format: 'wav',
    });

    return new TtsResponse(sentence, howlSound);
  });
}

export {TtsRequest, TtsResponse, makeTtsRequest};