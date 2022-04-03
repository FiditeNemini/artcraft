import * as React from 'react';
import Howl from 'howler';
import {makeTtsRequest} from '../../../TtsService'
import ApiConfig from '../../../ApiConfig';

interface Props {
  apiConfig: ApiConfig,
  text: String,
  howl: Howl,
}

interface State {
}

class TextAudioTrack extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  play = () => {
    console.log('Track clicked');
    this.props.howl.play();
  }

  reload = () => {
    console.log('Reload clicked');

    const sentence = this.props.text.toString();
    
    makeTtsRequest(sentence, this.props.apiConfig).then(response => {
      response.howl.play();
    });
  }

  public render() {
    return (
      <div className="track">
        <span 
          className="play_button" 
          onClick={this.play}>&#x25b6;</span>
        <span
          className="reload_button"
          onClick={this.reload}>&#x21bb;</span>
        <span 
          className="track_text"
          onClick={this.play}>{this.props.text}</span>
      </div>
    );
  }
}

export default TextAudioTrack;