import Howl from 'howler';
import React from 'react';
import { SpeakRequest } from './SpeakRequest';
import { Speaker } from '../../model/Speakers';
import { createColorMap, linearScale } from "@colormap/core";
import { MAGMA } from "@colormap/presets";
import { Spectrogram } from './extras/Spectrogram';
import { SpectrogramMode } from '../../App';
import { Utterance } from '../../model/utterance';

interface Props {
  currentSpeaker: Speaker,
  spectrogramMode: SpectrogramMode,
  currentText: string,
  textCharacterLimit: number,
  enableSpectrograms: boolean,
  clearStatusCallback: () => void,
  setHintMessage: (message: string) => void,
  onSpeakRequestCallback: () => void,
  onSpeakSuccessCallback: () => void,
  onSpeakErrorCallback: () => void,
  onPlayCallback: () => void,
  onStopCallback: () => void,
  updateSpectrogramCallback: (spectrogram: Spectrogram) => void,
  appendUtteranceCallback: (utterance: Utterance) => void,
  setTextCallback: (text: string) => void,
}

interface State {
  howl?: Howl,
}

class Form extends React.Component<Props, State> {

  textarea: HTMLTextAreaElement | null | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public speak(sentence: string, speaker: Speaker) {
    let request = new SpeakRequest(sentence, speaker.getSlug());

    console.log("Making SpeakRequest:", request);

    this.props.onSpeakRequestCallback();

    if (this.props.enableSpectrograms) {
      this.speakWithSpectrogram(sentence, speaker, request);
    } else {
      this.speakWithoutSpectrogram(sentence, speaker, request);
    }
  }

  speakWithSpectrogram(sentence: string, speaker: Speaker, request: SpeakRequest) {
    //const url = this.props.apiConfig.getEndpoint('/speak_spectrogram');
    const url = 'https://mumble.stream/speak_spectrogram';

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      const data = `data:audio/wav;base64,${res.audio_base64}`;
      (window as any).audio_base64 = res.audio_base64;

      // var image = new Image();
      // image.src = `data:image/bmp;base64,${res.spectrogram.bytes_base64}`;
      // console.log('image', image);

      let scale = linearScale([0, 255], [0, 1]);
      let colorMap = createColorMap(MAGMA, scale);

      // https://stackoverflow.com/a/21797381
      function base64ToArrayBuffer(base64string: string) : Uint8ClampedArray {
        var binary_string = window.atob(base64string);
        var len = binary_string.length * 4;
        let bytes = new Uint8ClampedArray(len);
        for (let i = 0, j = 0; i < len; i++, j += 4) {
          let val = binary_string.charCodeAt(i);
          if (isNaN(val)) {
            val = 0;
          }
          let mapped = colorMap(val);
          let r = Math.floor(mapped[0] * 255)
          let g = Math.floor(mapped[1] * 255)
          let b = Math.floor(mapped[2] * 255)
          bytes[j+0] = r;
          bytes[j+1] = g;
          bytes[j+2] = b;
          bytes[j+3] = 255;
        }
        return bytes;
      }

      let bytes = base64ToArrayBuffer(res.spectrogram.bytes_base64);

      let base64ByteString = res.spectrogram.bytes_base64;

      const spectrogram = new Spectrogram(base64ByteString, bytes, res.spectrogram.width, res.spectrogram.height);
      this.props.updateSpectrogramCallback(spectrogram);

      const sound = new Howl.Howl({
        src: [data],
        format: 'wav',
        // NB: Attempting to get this working on iPhone Safari
        // https://github.com/goldfire/howler.js/issues/1093
        // Other issues cite needing to cache a single player 
        // across all user interaction events.
        html5: true,
      });
      
      this.setState({
        howl: sound,
      });

      sound.play();

      const utterance = new Utterance(sentence, speaker, sound, res.audio_base64, undefined);
      this.props.appendUtteranceCallback(utterance);

      (window as any).sound = sound;
    })
    .catch(e => {
      this.props.onSpeakErrorCallback();
    });
  }

  speakWithoutSpectrogram(sentence: string, speaker: Speaker, request: SpeakRequest) {
    //const url = this.props.apiConfig.getEndpoint('/speak_spectrogram');
    const url = 'https://mumble.stream/speak';

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    .then(res => res.blob())
    .then(blob => {
      const audioUrl = window.URL.createObjectURL(blob);
      //console.log(url);

      const sound = new Howl.Howl({
        src: [audioUrl],
        format: 'wav',
        // NB: Attempting to get this working on iPhone Safari
        // https://github.com/goldfire/howler.js/issues/1093
        // Other issues cite needing to cache a single player 
        // across all user interaction events.
        html5: true,
      });
      
      this.setState({howl: sound});
      sound.play();

      const utterance = new Utterance(sentence, speaker, sound, undefined, audioUrl);
      this.props.appendUtteranceCallback(utterance);

      (window as any).sound = sound;
    })
    .catch(e => {
      this.props.onSpeakErrorCallback();
    });
  }

  clear() {
    this.props.setTextCallback('');
  }

  handleTextChange = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const text = (ev.target as HTMLTextAreaElement).value;

    ev.preventDefault();

    let pseudoWords = text.split(' ');

    if (text.length > 0) {
      if (pseudoWords.length > 0 && pseudoWords.length < 4) {
        this.props.setHintMessage("Hint: It sounds better when you type more words.");
      } else if (pseudoWords.length > 5) {
        this.props.setHintMessage("Hint: Use the ESC key to clear if you're on your computer.");
      }
    } else {
      this.props.clearStatusCallback();
    }

    this.props.setTextCallback(text);

    return false;
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();
    this.speak(this.props.currentText, this.props.currentSpeaker);
    return false;
  }

  handleCancelClick = (ev: React.FormEvent<HTMLButtonElement>) : boolean => {
    ev.preventDefault();
    this.clear();
    return false;
  }

  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) : boolean => {
    if (ev.keyCode === 27) {
      // Escape key
      this.clear();
    }
    return true;
  }
  
  componentDidMount() {
    this.textarea?.focus();
  }

  public render() {
    let remainingCharacters = this.props.textCharacterLimit - this.props.currentText.length;

    let remainingCharactersButtonDisabled = false;
    let remainingCharactersClassName = "";

    if (remainingCharacters < 0) {
      remainingCharactersButtonDisabled= true;
      remainingCharactersClassName = "has-text-danger";
    }

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>

          <textarea 
            className="textarea"
            onChange={this.handleTextChange} 
            onKeyDown={this.handleKeyDown}
            value={this.props.currentText} 
            ref={(textarea) => { this.textarea = textarea; }} 
            />
          <span className={remainingCharactersClassName}>{remainingCharacters}</span>

          <div className="button-group">
            <div className="columns is-mobile">
              <div className="column has-text-centered">
                <button className="button is-info is-large" disabled={remainingCharactersButtonDisabled}>Speak</button>
              </div>
              <div className="column has-text-centered">
                <button className="button is-info is-light is-large" onClick={this.handleCancelClick}>Cancel</button>
              </div>
            </div>
          </div>

        </form>
      </div>
    );
  }
}

export { Form };
