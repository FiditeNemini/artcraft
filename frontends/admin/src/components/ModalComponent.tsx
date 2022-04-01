import ApiConfig from '../ApiConfig';
import React from 'react';
import { ModeSelector } from './ModeSelector';
import { SentencesComponent } from './modes/sentences/SentencesComponent'
import { MainComponent } from './MainComponent'
import { SpeakerSpectrogramModeComponent } from './modes/speaker_spectrogram_mode/SpeakerSpectrogramModeComponent';

enum Mode {
  SPEAKER,
  SPEAKER_SPECTROGRAM,
  ADVANCED,
  SENTENCE,
}

interface Props {
  apiConfig: ApiConfig,
}

interface State {
  mode: Mode,
  text: string,
  reloadModel: boolean,
}

class ModalComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: Mode.SPEAKER,
      text: '',
      reloadModel: false,
    };
  }

  switchMode = (mode: Mode) => {
    this.setState({ mode: mode });
  }

  updateText = (text: string) => {
    this.setState({ text: text });
  }

  updateReloadCheckbox = (reload: boolean) => {
    this.setState({ reloadModel: reload });
  }

  public render() {
    let component;

    switch (this.state.mode) {
      case Mode.SPEAKER:
      case Mode.ADVANCED:
        // TODO: CLEAN THIS UP.
        // Share the text input, but change the form logic and dropdowns.
        component = <MainComponent
          apiConfig={this.props.apiConfig}
          mode={this.state.mode }
          text={this.state.text}
          reloadModel={this.state.reloadModel}
          updateTextCallback={this.updateText} 
          updateReloadCheckboxCallback={this.updateReloadCheckbox}
          />;
        break;
      case Mode.SPEAKER_SPECTROGRAM:
        component = <SpeakerSpectrogramModeComponent
          apiConfig={this.props.apiConfig}
          text={this.state.text}
          reloadModel={this.state.reloadModel}
          updateTextCallback={this.updateText}
          updateReloadCheckboxCallback={this.updateReloadCheckbox}
          />;
        break;
      case Mode.SENTENCE:
        component = <SentencesComponent apiConfig={this.props.apiConfig} />;
        break;
    }
    
    return (
      <div>
        <ModeSelector mode={this.state.mode} switchModeCallback={this.switchMode} />
        <hr />
        {component}
      </div>
    );
  }
}

export { ModalComponent, Mode };
