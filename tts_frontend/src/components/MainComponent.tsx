import React from 'react';
import TextInput from './modes/advanced_mode/TextInput';
import TrackList from './modes/advanced_mode/TrackList';
import { SpeakerModeComponent } from './modes/speaker_mode/SpeakerModeComponent';

enum Mode {
  SPEAKER,
  ADVANCED,
}

interface Props {
}

interface State {
  utterances: Array<TextAudioPair>
  mode: Mode,
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
    this.state = { 
      utterances: new Array(),
      mode: Mode.ADVANCED,
    };
  }

  /** Add a new audio track. */
  appendUtterance = (utterance: TextAudioPair) => {
    console.log('utterance', utterance);
    console.log('this', this);
    let utterances = this.state.utterances.slice();
    utterances.push(utterance);
    this.setState({utterances: utterances});
  }

  changeMode = () => {
    let nextMode;
    switch (this.state.mode) {
      case Mode.ADVANCED:
        nextMode = Mode.SPEAKER;
        break;

      case Mode.SPEAKER:
        nextMode = Mode.ADVANCED;
        break;
    }
    this.setState({
      mode: nextMode
    });
  }

  public render() {
    let component;
    if (this.state.mode == Mode.ADVANCED) {
      component = this.renderAdvancedMode();
    } else {
      component = this.renderSpeakerMode();
    }

    return (
      <div>
        <button onClick={this.changeMode}>Change Mode</button>
        <hr />
        {component}
      </div>
    )
  }

  public renderAdvancedMode() {
    return (
      <div>
        <TextInput appendUtteranceCallback={this.appendUtterance} />
        <TrackList utterances={this.state.utterances} />
      </div>
    );
  }

  public renderSpeakerMode() {
    return (
      <div>
        <SpeakerModeComponent></SpeakerModeComponent>
      </div>
    );
  }
}

export {TextAudioPair, MainComponent};
