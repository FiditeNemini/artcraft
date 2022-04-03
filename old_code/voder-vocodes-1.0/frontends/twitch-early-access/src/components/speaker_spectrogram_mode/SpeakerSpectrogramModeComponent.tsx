import React from 'react';
import SpeakerSpectrogramAudioForm from './SpeakerSpectrogramAudioForm';
import ApiConfig from '../../api/ApiConfig';
import { Speaker } from '../../model/Speaker';

interface Props {
  apiConfig: ApiConfig,
  currentText: string,
  currentSpeaker?: Speaker,
  updateTextCallback: (text: string) => void,
}

interface State {
}

class SpeakerSpectrogramModeComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    return (
      <div>
        <SpeakerSpectrogramAudioForm 
          apiConfig={this.props.apiConfig}
          currentText={this.props.currentText}
          currentSpeaker={this.props.currentSpeaker}
          updateTextCallback={this.props.updateTextCallback}
          />
      </div>
    );
  }
}

export { SpeakerSpectrogramModeComponent };
