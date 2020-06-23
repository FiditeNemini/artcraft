import React from 'react';
import { Speaker } from '../../../Speakers';
import { Avatar } from './Avatar';

interface Props {
  currentSpeaker: Speaker,
}

interface State {
}

class SpeakerInfo extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    return (
      <div>
        Speaker Info
        <Avatar currentSpeaker={this.props.currentSpeaker} />
      </div>
    )
  }
}

export { SpeakerInfo };
