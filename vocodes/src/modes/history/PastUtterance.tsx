import React from 'react';
import { Utterance } from "../../model/utterance";

interface Props {
  utterance: Utterance,
}

interface State {
}

class PastUtterance extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  play = () => {
    this.props.utterance.howl.play();
  }

  public render() {
    let url = `data:audio/wav;base64,${this.props.utterance.base64data}`;
    return (
      <div>
        <h3>{this.props.utterance.speaker.getName()}</h3>
        {this.props.utterance.originalText}
        <br/>
        <button onClick={this.play}>Play</button>
        <a href={url} download="vocodes.wav">Download</a>
      </div>
    )
  }
}

export { PastUtterance }