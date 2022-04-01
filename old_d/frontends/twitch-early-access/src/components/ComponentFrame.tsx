import React from 'react';
import ApiConfig from '../api/ApiConfig';
import { SpeakerSpectrogramModeComponent } from './speaker_spectrogram_mode/SpeakerSpectrogramModeComponent';
import { SpeakerModeComponent } from './speaker_mode/SpeakerModeComponent';
import { Speaker } from '../model/Speaker';

enum ShowComponent {
  SPEAK,
  SPEAK_SPECTROGRAM,
}

interface Props {
  showComponent: ShowComponent,
  apiConfig: ApiConfig,
  currentText: string,
  currentSpeaker?: Speaker,
  updateTextCallback: (text: string) => void,
}

interface State {
}

class ComponentFrame extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {

    switch (this.props.showComponent) {
      case ShowComponent.SPEAK_SPECTROGRAM:
        return <SpeakerSpectrogramModeComponent 
          apiConfig={this.props.apiConfig}
          currentText={this.props.currentText}
          currentSpeaker={this.props.currentSpeaker}
          updateTextCallback={this.props.updateTextCallback}
          />;
      case ShowComponent.SPEAK:
      default:
        return <SpeakerModeComponent 
          apiConfig={this.props.apiConfig}
          currentText={this.props.currentText}
          currentSpeaker={this.props.currentSpeaker}
          updateTextCallback={this.props.updateTextCallback}
          />;
    }
  }

}

export { ComponentFrame, ShowComponent }
