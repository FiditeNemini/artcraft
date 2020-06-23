import React from 'react';
import { Form } from './Form';
import { StatusText } from './StatusText';
import { getRandomInt } from '../../Utils';
import { Avatar } from './extras/Avatar';
import { SpeakerDropdown } from './SpeakerDropdown';
import { Speaker } from '../../Speakers';
import { ExtrasComponent, ExtrasMode } from './extras/ExtrasComponent';
import { Spectrogram } from './extras/Spectrogram';

enum StatusState {
  NONE,
  INFO,
  WARN,
  ERROR,
}

interface Props {
  currentSpeaker: Speaker,
  extrasMode: ExtrasMode,
  changeSpeakerCallback: (slug: string) => void,
  changeExtrasModeCallback: (extrasMode: ExtrasMode) => void,
}

interface State {
  statusState: StatusState;
  statusMessage: string,
  isTalking: boolean,
  currentSpectrogram?: Spectrogram,
}

class SpeakComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      statusState: StatusState.NONE,
      statusMessage: '',
      isTalking: false,
      currentSpectrogram: undefined,
    };
  }

  setMessage = (statusState: StatusState, message: string) => {
    this.setState({
      statusState: statusState,
      statusMessage: message,
    })
  }

  setHintMessage = (message: string) => {
    this.setMessage(StatusState.INFO, message);
  }

  clearMessage = () => {
    this.setState({
      statusState: StatusState.NONE,
      statusMessage: '',
    })
  }

  onSpeakRequest = () => {
    let message;
    switch (getRandomInt(0, 4)) {
      case 0:
        message = "Requesting...";
        break;
      case 1:
        message = "Sending...";
        break;
      case 3:
        message = "Calculating...";
        break;
      case 4:
      default:
        message = "Inferring...";
        break;
    }
    this.setMessage(StatusState.INFO, message);
  }

  onSpeakSuccess = () => {
    let message;
    switch (getRandomInt(0, 4)) {
      case 0:
        message = "Success!";
        break;
      case 1:
        message = "Playing.";
        break;
      case 3:
        message = "Here's some audio.";
        break;
      case 4:
      default:
        message = "Got it.";
        break;
    }
    this.setMessage(StatusState.INFO, message);
  }

  onSpeakError = () => {
    this.setMessage(StatusState.ERROR, "There was an error. Perhaps you sent too much text or the server is busy. Try again.");
  }

  onPlay = () => {
    this.setState({ isTalking: true });
  }

  onStop = () => {
    this.setState({ isTalking: false });
  }

  updateSpectrogram = (spectrogram: Spectrogram) => {
    this.setState({ currentSpectrogram: spectrogram });
  }

  public render() {
    return (
      <div>
        <SpeakerDropdown 
          currentSpeaker={this.props.currentSpeaker} 
          changeSpeakerCallback={this.props.changeSpeakerCallback} 
          />

        <div>
          <ExtrasComponent 
            extrasMode={this.props.extrasMode}
            currentSpeaker={this.props.currentSpeaker} 
            currentSpectrogram={this.state.currentSpectrogram}
            changeExtrasModeCallback={this.props.changeExtrasModeCallback}
            />
        </div>

        <StatusText 
          statusState={this.state.statusState} 
          statusMessage={this.state.statusMessage}
          />
        <Form 
          currentSpeaker={this.props.currentSpeaker}
          clearStatusCallback={this.clearMessage}
          setHintMessage={this.setHintMessage}
          onSpeakRequestCallback={this.onSpeakRequest}
          onSpeakSuccessCallback={this.onSpeakSuccess}
          onSpeakErrorCallback={this.onSpeakError}
          onPlayCallback={this.onPlay}
          onStopCallback={this.onStop}
          updateSpectrogramCallback={this.updateSpectrogram}
          />
      </div>
    );
  }
}

export { SpeakComponent, StatusState };
