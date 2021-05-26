import React from 'react';
import { Speaker } from '../../../model/Speakers';

interface Props {
  currentSpeaker: Speaker;
}

interface State {
}

class Avatar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  public render() {
    let source;

    if (this.props.currentSpeaker.hasAvatar()) {
      source = `/avatars/${this.props.currentSpeaker.avatarUrl!}`;
    } else {
      source = `https://via.placeholder.com/300x300/FF0000/FFFFFF?text=${this.props.currentSpeaker.getSlug()}`;
    }

    return (
      <div>
        <img src={source} id="avatar" alt="speaker" />
      </div>
    );
  }
}

export { Avatar };
