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
    let number = this.props.utterance.id + 1;
    let filename = `vocodes_${this.props.utterance.speaker.slug}_${number}.wav`;

    return (
      <div key={this.props.utterance.id} className="box">
        <div className="columns">
          <div className="column is-one-fifth">
            <MiniAvatar speaker={this.props.utterance.speaker} />
          </div>
          <div className="column is-four-fifths">
            <h3 className="title is-4">
              Utterance #{number}:&nbsp;
              {this.props.utterance.speaker.getName()}
            </h3>
            <div className="content">
              <p>
                {this.props.utterance.originalText}
              </p>
            </div>
            
            <div className="columns is-mobile">
              <div className="column">
                <button className="button is-medium" onClick={this.play}>Play</button>
              </div>
              <div className="column">
                <a className="button is-medium" 
                   href={this.props.utterance.getUrl()}
                   download={filename}>Download</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export { PastUtterance }