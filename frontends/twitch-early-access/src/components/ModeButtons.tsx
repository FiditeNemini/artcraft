import React from 'react';
import { ShowComponent } from './ComponentFrame';

interface Props {
  showComponent: ShowComponent,
  switchShowComponentCallback: (sc: ShowComponent) => void,
}

interface State {
}

class ModeButtons extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public updateText(text: string) {
  }

  public render() {
    let speakDisabled = false;
    let spectrogramDisabled = false;

    switch (this.props.showComponent) {
      case ShowComponent.SPEAK:
        speakDisabled = true;
        break;
      case ShowComponent.SPEAK_SPECTROGRAM:
        spectrogramDisabled = true;
        break;
    }

    return (
      <div>

        <button 
          className="button is-primary is-large"
          onClick={() => this.props.switchShowComponentCallback(ShowComponent.SPEAK)}
          disabled={speakDisabled}
          >
          Speak
        </button>
        <button 
          className="button is-primary is-large"
          onClick={() => this.props.switchShowComponentCallback(ShowComponent.SPEAK_SPECTROGRAM)}
          disabled={spectrogramDisabled}
          >
          Speak Spectrogram
        </button>
      </div>
    );
  }
}

export default ModeButtons;
