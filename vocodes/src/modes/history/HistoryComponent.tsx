import React from 'react';
import { Utterance } from '../../model/utterance';
import { PastUtterance } from './PastUtterance';

interface Props {
  utterances: Utterance[],
}

interface State {
}

class HistoryComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    let utterances = this.props.utterances.map((utterance) => {
      return <PastUtterance utterance={utterance} />
    });

    if (utterances.length === 0) {
      utterances = [
        <p>
          Nothing yet! Utterances will show up here once you've submitted 
          something to the text to speech engine. You'll be able to replay
          them and download the wav files.
        </p>
      ];
    } else {
      utterances.unshift(
        <p>Note: these will disappear when you leave the page.</p>
      );
    }
    return (
      <div className="history_component">
        {utterances}
        <p>
          Please cite <strong>vo.codes</strong> if you make YouTube videos,
          post on social media, or find this project useful.
        </p>
      </div>
    )
  }
}

export { HistoryComponent }