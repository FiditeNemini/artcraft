import React from 'react';
import { Speaker } from '../../../Speakers';
import { SpeakerInfo } from './SpeakerInfo';
import { Spectrogram } from './Spectrogram';
import { SpectrogramComponent } from './SpectrogramComponent';
import { SpectrogramMode } from '../../../App';

enum ExtrasMode {
  SPEAKER_INFO,
  SPECTROGRAM,
}

interface Props {
  extrasMode: ExtrasMode,
  currentSpeaker: Speaker,
  currentSpectrogram?: Spectrogram,
  spectrogramMode: SpectrogramMode,
  changeExtrasModeCallback: (extrasMode: ExtrasMode) => void,
  changeSpectrogramMode: (spectrogramMode: SpectrogramMode) => void,
}

interface State {
}

class ExtrasComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public render() {
    let modeComponent;
    switch (this.props.extrasMode) {
      case ExtrasMode.SPEAKER_INFO:
        modeComponent = <SpeakerInfo currentSpeaker={this.props.currentSpeaker} />
        break;
      case ExtrasMode.SPECTROGRAM:
        modeComponent = <SpectrogramComponent 
          currentSpectrogram={this.props.currentSpectrogram} 
          spectrogramMode={this.props.spectrogramMode}
          changeSpectrogramMode={this.props.changeSpectrogramMode}
          />
        break;
    }
    return (
      <div>
        {modeComponent}
        <div className="extra_mode_buttons">
          <button onClick={() => this.props.changeExtrasModeCallback(ExtrasMode.SPEAKER_INFO)}>Speaker Info</button>
          <button onClick={() => this.props.changeExtrasModeCallback(ExtrasMode.SPECTROGRAM)}>Spectrogram</button>
        </div>
      </div>
    )
  }
}

export { ExtrasComponent, ExtrasMode };
