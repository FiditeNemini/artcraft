import React from 'react';
import Howl from 'howler';

interface Props {
  text: String,
  howl: Howl,
}

interface State {
}

class TextAudioTrack extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  play = () => {
    console.log('Track clicked');
    this.props.howl.play();
  }

  public render() {
    return (
      <div onClick={this.play}>
        Track:
        <p onClick={this.play}>{this.props.text}</p>
      </div>
    );
  }
}

export default TextAudioTrack;