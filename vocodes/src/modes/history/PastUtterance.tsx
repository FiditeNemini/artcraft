import React from 'react';
import { Utterance } from "../../model/utterance";
import { MiniAvatar } from './MiniAvatar';

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
    let number = this.props.utterance.id + 1;
    let filename = `vocodes_${this.props.utterance.speaker.slug}_${number}.wav`;

    return (
      <div key={this.props.utterance.id} className="utterance">
        <div className="avatar">
          <MiniAvatar speaker={this.props.utterance.speaker} />
        </div>
        <div className="details">
          <h3>
            Utterance #{number}:
            {this.props.utterance.speaker.getName()}
          </h3>
          {this.props.utterance.originalText}
          <br/>
          <button onClick={this.play}>Play</button>
          <a href={url} download={filename}>Download</a>
        </div>
        <div className="clear" />
      </div>
    )
  }
}

export { PastUtterance }