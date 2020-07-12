import React from 'react';
import { Speaker } from '../../../model/Speakers';
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
    if (this.props.currentSpeaker.hasFull()) {
      let source = `/full/${this.props.currentSpeaker.fullUrl!}`;
      return (
        <figure className="image is-4by3">
          <img src={source} alt="speaker"></img>
        </figure>
      )
    }
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
