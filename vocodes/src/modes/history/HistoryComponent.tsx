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
    const utterances = this.props.utterances.map((utterance) => {
      return <PastUtterance utterance={utterance} />
    });
    return (
      <div>
        {utterances}
      </div>
    )
  }
}

export { HistoryComponent }