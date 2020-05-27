import React from 'react';
import Howl from 'howler';
import {TextAudioPair }from '../../MainComponent'
import { ModelPickerDropdownComponent } from './ModelPickerDropdownComponent';

interface Props {
  appendUtteranceCallback: (utterance: TextAudioPair) => void
}

interface State {
  text?: String,
  howl?: Howl,
  arpabet_tacotron_model?: string,
  melgan_model?: string,
}

/// Requests to the backend.
class TtsRequest {
  text: String
  speaker: String
  arpabet_tacotron_model?: string
  melgan_model?: string

  constructor(text: String) {
    this.text = text;
    // LJSpeech dataset from Keith Ito & LibriVox, spoken by Linda Johnson.
    this.speaker = 'linda'; 
  }
}

class TextInput extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      text: undefined,
      howl: undefined,
    };
  }

  componentDidMount() {
    // OnMount events. An async CTOR, essentially.
  }

  handleTextChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const text = (ev.target as HTMLInputElement).value;
    this.setState({text: text});
  }

  handleArpabetTacotronModelChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    console.log('callback A');
    const model = (ev.target as HTMLInputElement).value;
    this.setState({arpabet_tacotron_model: model});
  }

  handleMelganModelChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    console.log('callback B');
    const model = (ev.target as HTMLInputElement).value;
    this.setState({melgan_model: model});
  }

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    console.log("Form Submit");

    if (!this.state.text) {
      return;
    }

    let request = new TtsRequest(this.state.text);
    request.arpabet_tacotron_model = this.state.arpabet_tacotron_model || "";
    request.melgan_model = this.state.melgan_model || "";

    const url = 'http://localhost:12345/advanced_tts';
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
      console.log(blob);

      const url = window.URL.createObjectURL(blob);
      console.log(url);

      const sound = new Howl.Howl({
        src: [url],
        format: 'wav',
      });
      
      this.setState({howl: sound});
      sound.play();

      this.props.appendUtteranceCallback(new TextAudioPair(request.text, sound));

      (window as any).sound = sound;
    });

    ev.preventDefault();
    return false;
  }

  public render() {
    return (
      <form onSubmit={this.makeRequest}>
        <input onChange={this.handleTextChange} />
        <ModelPickerDropdownComponent 
          changeArpabetTacotronCallback={this.handleArpabetTacotronModelChange}
          changeMelganCallback={this.handleMelganModelChange}
        />
        <button>Submit</button>
      </form>
    );
  }
}

export default TextInput;
