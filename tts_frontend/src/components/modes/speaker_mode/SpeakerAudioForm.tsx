import React from 'react';
import Howl from 'howler';
import ApiConfig from '../../../ApiConfig';
import { SpeakRequest } from '../../../api/ApiDefinition'

interface Props {
  apiConfig: ApiConfig,
  speaker?: String,
}

interface State {
  text?: String,
  howl?: Howl,
}


class SpeakerAudioForm extends React.Component<Props, State> {

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

    let request = new SpeakRequest(this.state.text, this.props.speaker!);

    const url = this.props.apiConfig.getEndpoint('/speak');

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
    });

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

export default SpeakerAudioForm;
