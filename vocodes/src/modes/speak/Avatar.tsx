import React from 'react';
import { Speaker } from '../../Speakers';

interface Props {
  currentSpeaker: Speaker;
}

interface State {
}

class Avatar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    const source = `https://via.placeholder.com/300x300/FF0000/FFFFFF?text=${this.props.currentSpeaker.getSlug()}`;
    return (
      <div>
        <img src={source} alt="speaker image" />
      </div>
    );
  }
}

export { Avatar };
