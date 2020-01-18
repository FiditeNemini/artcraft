import React from 'react';
import Howl from 'howler';
import TextInput from './TextInput';
import TrackList from './TrackList';

interface Props {
}

interface State {
  utterances: Array<TextAudioPair>
}

class TextAudioPair {
  text: String
  howl: Howl

  constructor(text: String, howl: Howl) {
    this.text = text;
    this.howl = howl;
  }
}

/** Main Component */
class MainComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { utterances: new Array() };
    //this.setState({utterances: new Array()});
  }

  /** Add a new audio track. */
  appendUtterance = (utterance: TextAudioPair) => {
    console.log('utterance', utterance);
    console.log('this', this);
    let utterances = this.state.utterances.slice();
    utterances.push(utterance);
    this.setState({utterances: utterances});
  }

  public render() {
    return (
      <div>
        <TextInput appendUtteranceCallback={this.appendUtterance} />
        <TrackList utterances={this.state.utterances} />
      </div>
    );
  }
}

export {TextAudioPair, MainComponent};
