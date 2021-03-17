import React from 'react';
import { Utterance } from '../model/Utterance';

interface Props {
  utterances: Utterance[],
}

interface State {
}

class UtteranceHistory extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    let utterances = this.props.utterances.map(utterance => {
      return (
        <div className="box">
          <article className="media">
            <div className="media-content">
              <div className="content">
                <p>
                  <strong>{utterance.speaker.name}</strong> <small>{utterance.speaker.slug}</small>
                  <br />
                  {utterance.text}
                </p>
                <p>
                  <a onClick={() => utterance.howl.play()}>Play</a>
                </p>
                <p>
                  <a href={utterance.url} target="_blank" download="vocodes-early-access.wav">Download</a>
                </p>
              </div>
            </div>
          </article>
        </div>
      )
    });

    return (
      <div>
        {utterances}
      </div>
    );
  }
}

export { UtteranceHistory };
