import React from 'react';
import TextInput from './modes/advanced_mode/TextInput';
import TrackList from './modes/advanced_mode/TrackList';
import { SpeakerModeComponent } from './modes/speaker_mode/SpeakerModeComponent';
import ApiConfig from '../ApiConfig';
import { Mode } from './ModalComponent'

// TODO: CLEAN THIS UP.
// `ModalComponent` is the new way of organizing this. This needs to be cannibalized 
// and broken into sub-components that `ModalComponent` controls.

interface Props {
  apiConfig: ApiConfig,
  mode: Mode,
  text: string,
  reloadModel: boolean,
  updateTextCallback: (text: string) => void,
  updateReloadCheckboxCallback: (reload: boolean) => void,
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
    this.state = { 
      utterances: new Array(),
    };
  }

  /** Add a new audio track. */
  appendUtterance = (utterance: TextAudioPair) => {
    console.log('utterance', utterance);
    let utterances = this.state.utterances.slice();
    utterances.push(utterance);
    this.setState({utterances: utterances});
  }

  public render() {
    let component;
    if (this.props.mode == Mode.ADVANCED) {
      component = this.renderAdvancedMode();
    } else {
      component = this.renderSpeakerMode();
    }

    return (
      <div>
        {component}
      </div>
    )
  }

  public renderAdvancedMode() {
    return (
      <div>
        <TextInput 
          appendUtteranceCallback={this.appendUtterance} 
          apiConfig={this.props.apiConfig} 
          />
        <TrackList 
          apiConfig={this.props.apiConfig}
          utterances={this.state.utterances} 
          />
      </div>
    );
  }

  public renderSpeakerMode() {
    return (
      <div>
        <SpeakerModeComponent 
          apiConfig={this.props.apiConfig}
          text={this.props.text}
          reloadModel={this.props.reloadModel}
          updateTextCallback={this.props.updateTextCallback}
          updateReloadCheckboxCallback={this.props.updateReloadCheckboxCallback}
          />
      </div>
    );
  }
}

export {TextAudioPair, MainComponent};
