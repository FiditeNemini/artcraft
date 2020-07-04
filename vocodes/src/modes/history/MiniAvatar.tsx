import React from 'react';
import { Speaker } from '../../Speakers';

interface Props {
  speaker: Speaker;
}

interface State {
}

class MiniAvatar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    let source;

    if (this.props.speaker.hasAvatar()) {
      source = `/avatars/${this.props.speaker.avatarUrl!}`;
    } else {
      source = `https://via.placeholder.com/300x300/FF0000/FFFFFF?text=${this.props.speaker.getSlug()}`;
    }
    console.log('test', source, this.props.speaker.getAvatar());

    return (
      <div>
        <img src={source} className="mini_avatar" alt="speaker" />
      </div>
    );
  }
}

export { MiniAvatar };
