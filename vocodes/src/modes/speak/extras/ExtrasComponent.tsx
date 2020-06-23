import React from 'react';
import { Speaker } from '../../../Speakers';
import { SpeakerInfo } from './SpeakerInfo';
import { Spectrogram } from './Spectrogram';
import { SpectrogramComponent } from './SpectrogramComponent';

enum ExtrasMode {
  SPEAKER_INFO,
  SPECTROGRAM,
}

interface Props {
  extrasMode: ExtrasMode,
  currentSpeaker: Speaker,
  currentSpectrogram?: Spectrogram,
  changeExtrasModeCallback: (extrasMode: ExtrasMode) => void,
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
        modeComponent = <SpectrogramComponent currentSpectrogram={this.props.currentSpectrogram} />
        break;
    }
    return (
      <div>
        <div>
          <button onClick={() => this.props.changeExtrasModeCallback(ExtrasMode.SPEAKER_INFO)}>Speaker Info</button>
          <button onClick={() => this.props.changeExtrasModeCallback(ExtrasMode.SPECTROGRAM)}>Spectrogram</button>
        </div>
        {modeComponent}
      </div>
    )
  }
}

export { ExtrasComponent, ExtrasMode };
