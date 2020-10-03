import React from 'react';
import Howl from 'howler';
import ApiConfig from '../../../ApiConfig';
import { SpeakRequest } from '../../../api/ApiDefinition'

interface Props {
  apiConfig: ApiConfig,
  speaker?: String,
  text: string,
  reloadModel: boolean,
  updateTextCallback: (text: string) => void,
  updateReloadCheckboxCallback: (reload: boolean) => void,
}

interface State {
  howl?: Howl,
}


class SpeakerAudioForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      howl: undefined,
    };
  }

  componentDidMount() {
    // OnMount events. An async CTOR, essentially.
  }

  handleTextChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const text = (ev.target as HTMLInputElement).value;
    this.props.updateTextCallback(text);
  }

  handleReloadCheckboxChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const checked = (ev.target as HTMLInputElement).checked;
    this.props.updateReloadCheckboxCallback(checked);
  }

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    console.log("Form Submit");

    if (!this.props.text) {
      return;
    }

    let request = new SpeakRequest(this.props.text, this.props.speaker!);

    if (this.props.reloadModel) {
      request.setReloadModel(true);
    }

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
      //console.log(blob);
      const url = window.URL.createObjectURL(blob);

      console.log('download at the audio url:');
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
        <input onChange={this.handleTextChange} value={this.props.text} />
        <div>
          <input type="checkbox" onChange={this.handleReloadCheckboxChange} defaultChecked={this.props.reloadModel} /> <label>Reload model</label>
        </div>
        <button>Submit</button>
      </form>
    );
  }
}

export default SpeakerAudioForm;
