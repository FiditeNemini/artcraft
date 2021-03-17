import React from 'react';
import Howl from 'howler';
import ApiConfig from '../../api/ApiConfig';
import { SpeakRequest } from '../../api/ApiDefinition'
import { Speaker } from '../../model/Speaker';

interface Props {
  apiConfig: ApiConfig,
  currentSpeaker?: Speaker,
  currentText: string,
  updateTextCallback: (text: string) => void,
}

interface State {
  howl?: Howl.Howl,
}


class SpeakerAudioForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      howl: undefined,
    };
  }

  handleTextChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const text = (ev.target as HTMLInputElement).value;
    this.props.updateTextCallback(text);
  }

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    console.log("Form Submit");

    if (!this.props.currentText) {
      return;
    }

    if (this.props.currentSpeaker === undefined) {
      return;
    }

    let request = new SpeakRequest(this.props.currentText, this.props.currentSpeaker!.slug);

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
      const url = window.URL.createObjectURL(blob);

      console.log('download at the audio url:');
      console.log(url);

      const sound = new Howl.Howl({
        src: [url],
        format: ['wav'],
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
        <input onChange={this.handleTextChange} value={this.props.currentText} />
        <button>Submit</button>
      </form>
    );
  }
}

export default SpeakerAudioForm;
