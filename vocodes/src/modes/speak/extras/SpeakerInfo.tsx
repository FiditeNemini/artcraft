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
      <div className="speaker_info_component">
        <div className="speaker_avatar">
          <Avatar currentSpeaker={this.props.currentSpeaker} />
        </div>
        <div className="speaker_details">
          {this.props.currentSpeaker.getDescription()}
        </div>
        <div className="speaker_break" />
      </div>
    )
  }
}

export { SpeakerInfo };
