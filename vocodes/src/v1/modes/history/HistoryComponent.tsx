import React from 'react';
import { Utterance } from '../../model/utterance';
import { PastUtterance } from './PastUtterance';

interface Props {
  utterances: Utterance[],
  resetModeCallback: () => void,
  clearHistoryCountBadgeCallback: () => void,
}

interface State {
}

class HistoryComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.props.clearHistoryCountBadgeCallback();
  }

  public render() {
    let utterances = this.props.utterances.map((utterance) => {
      return <PastUtterance utterance={utterance} />
    });

    if (utterances.length === 0) {
      utterances = [
        <div className="content is-size-4">
          <p>
            Nothing yet! Utterances will show up here once you've submitted 
            something to the text to speech engine. You'll be able to replay
            them and download the wav files.
          </p>
        </div>
      ];
    } else {
      utterances.unshift(
        <div className="content is-size-4">
          <p>Note: these will disappear when you leave the website.</p>
        </div>
      );
    }
    return (
      <div>
        {utterances}

        <div className="content is-size-4">
          <p>
            Please cite <strong><u>vocodes.com</u></strong> if you make YouTube videos,
            post on social media, or find this project useful.
          </p>

          <button className="button is-link is-medium" onClick={() => this.props.resetModeCallback()}>Go Back</button>
        </div>
      </div>
    )
  }
}

export { HistoryComponent }