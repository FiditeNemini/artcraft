import React from 'react';
import { Mode } from './ModalComponent';

interface Props {
  mode: Mode,
  switchModeCallback: any,
}

interface State {
}

class ModeSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    let speakerDisabled = false;
    let speakerSpectrogramDisabled = false;
    let advancedDisabled = false;
    let sentencesDisabled = false;

    switch (this.props.mode) {
      case Mode.SPEAKER:
        speakerDisabled = true;
        break;
      case Mode.SPEAKER_SPECTROGRAM:
        speakerSpectrogramDisabled = true;
        break;
      case Mode.ADVANCED:
        advancedDisabled = true;
        break;
      case Mode.SENTENCE:
        sentencesDisabled = true;
        break;
    }

    return (
      <nav>
        <button 
          disabled={speakerDisabled} 
          onClick={() => this.props.switchModeCallback(Mode.SPEAKER)}>
            Speakers
        </button>
        <button 
          disabled={speakerSpectrogramDisabled} 
          onClick={() => this.props.switchModeCallback(Mode.SPEAKER_SPECTROGRAM)}>
            Speaker + Spectrogram
        </button>
        <button 
          disabled={advancedDisabled}
          onClick={() => this.props.switchModeCallback(Mode.ADVANCED)}>
            Advanced
        </button>
        <button 
          disabled={sentencesDisabled}
          onClick={() => this.props.switchModeCallback(Mode.SENTENCE)}>
            Sentences
        </button>
      </nav>
    );
  }
}

export { ModeSelector };
