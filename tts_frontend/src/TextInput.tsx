import React from 'react';
import Howl from 'howler';

interface Props {
}

interface State {
  text?: String,
  howl?: Howl,
}

/// Requests to the backend.
class TtsRequest {
  text: String
  speaker: String

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

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    console.log("Form Submit");

    if (!this.state.text) {
      return;
    }

    let request = new TtsRequest(this.state.text);

    const url = `/tts`;
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
      (window as any).sound = sound;
    })

    //.then(res => res.json())
    //.then(...

    ev.preventDefault();
    return false;
  }

  public render() {
    return (
      <form onSubmit={this.makeRequest}>
        <input onChange={this.handleTextChange} />
        <button>Submit</button>
      </form>
    );
  }
}

export default TextInput;
