import React from 'react';
import ApiConfig from '../api/ApiConfig';
import { SpeakerSpectrogramModeComponent } from './speaker_spectrogram_mode/SpeakerSpectrogramModeComponent';
import { SpeakerModeComponent } from './speaker_mode/SpeakerModeComponent';

enum ShowComponent {
  SPEAK,
  SPEAK_SPECTROGRAM,
}

interface Props {
  showComponent: ShowComponent,
  apiConfig: ApiConfig,
  text: string,
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
          text={this.props.text}
          updateTextCallback={this.props.updateTextCallback}
          />;
      case ShowComponent.SPEAK:
      default:
        return <SpeakerModeComponent 
          apiConfig={this.props.apiConfig}
          text={this.props.text}
          updateTextCallback={this.props.updateTextCallback}
          />;
    }
  }

}

export { ComponentFrame, ShowComponent }
