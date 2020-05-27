import React from 'react';
import Howl from 'howler';
import { TextAudioPair } from '../../MainComponent';
import TextAudioTrack from './TextAudioTrack';

interface Props {
  utterances: Array<TextAudioPair>
}

interface State {
}

class TrackList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const tracks = this.props.utterances.map((utterance) =>
    <TextAudioTrack 
        key={utterance.text.toString()}
        text={utterance.text} 
        howl={utterance.howl}>
      {utterance.text}
    </TextAudioTrack>
    );
    return (
      <div>
        {tracks}
      </div>
    );
  }
}

export default TrackList;