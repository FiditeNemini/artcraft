import React from 'react';
import { Form } from './Form';
import { Speaker, SPEAKERS } from '../../model/Speakers';
import { SpeakerInfo } from './extras/SpeakerInfo';
import { Spectrogram } from './extras/Spectrogram';
import { SpectrogramComponent } from './extras/SpectrogramComponent';
import { SpectrogramMode } from '../../App';
import { StatusText } from './StatusText';
import { Utterance } from '../../model/utterance';
import { getRandomInt } from '../../Utils';

enum StatusState {
  NONE,
  INFO,
  WARN,
  ERROR,
}

enum ExtrasMode {
  SPEAKER_INFO,
  SPECTROGRAM,
}

interface Props {
  enableSpectrograms: boolean,
  extrasMode: ExtrasMode,
  currentSpeaker: Speaker,
  currentSpectrogram?: Spectrogram,
  spectrogramMode: SpectrogramMode,
  currentText: string,
  changeSpeakerCallback: (slug: string) => void,
  changeSpectrogramCallback: (spectrogram: Spectrogram) => void,
  changeExtrasModeCallback: (extrasMode: ExtrasMode) => void,
  changeSpectrogramMode: (spectrogramMode: SpectrogramMode) => void,
  appendUtteranceCallback: (utterance: Utterance) => void,
  setTextCallback: (text: string) => void,
}

interface State {
  statusState: StatusState;
  statusMessage: string,
  isTalking: boolean,
}

class SpeakComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      statusState: StatusState.NONE,
      statusMessage: '',
      isTalking: false,
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

  toggleMode = () => {
    switch (this.props.extrasMode) {
      case ExtrasMode.SPEAKER_INFO:
        this.props.changeExtrasModeCallback(ExtrasMode.SPECTROGRAM);
        break;
      case ExtrasMode.SPECTROGRAM:
        this.props.changeExtrasModeCallback(ExtrasMode.SPEAKER_INFO);
        break;
    }
  }

  changeSpeaker = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let slug = event.target.value;
    this.props.changeSpeakerCallback(slug);
  }

  public render() {
    let speakerPictureOrSpectrogram;
    switch (this.props.extrasMode) {
      case ExtrasMode.SPEAKER_INFO:
        speakerPictureOrSpectrogram = <SpeakerInfo currentSpeaker={this.props.currentSpeaker} />
        break;
      case ExtrasMode.SPECTROGRAM:
        speakerPictureOrSpectrogram = <SpectrogramComponent 
          currentSpectrogram={this.props.currentSpectrogram} 
          spectrogramMode={this.props.spectrogramMode}
          changeSpectrogramMode={this.props.changeSpectrogramMode}
          />
        break;
    }

    let switchButton = <span />
    if (this.props.enableSpectrograms) {
      let modeText;
      switch (this.props.extrasMode) {
        case ExtrasMode.SPEAKER_INFO:
          modeText = "Speaker Info";
          break;
        case ExtrasMode.SPECTROGRAM:
          modeText = "Spectrogram";
          break;
      }

      switchButton = <button 
        className="button is-light is-info"
        onClick={this.toggleMode}>{modeText}</button>
    }

    let bestSpeakerOptions : any[] = [];
    let goodSpeakerOptions : any[] = [];
    let badSpeakerOptions : any[] = [];
    let terribleSpeakerOptions : any[] = [];

    SPEAKERS.forEach(speaker => {
      const quality = speaker.getVoiceQuality();
      const slug = speaker.getSlug();
      let selected = undefined;
      if (this.props.currentSpeaker.slug === speaker.slug) {
        selected = true;
      }
      const option = <option 
        key={slug} 
        value={speaker.getSlug()} 
        selected={selected}>{speaker.getName()}</option>;

      if (quality >= 7.5) {
        bestSpeakerOptions.push(option);
      } else if (quality >= 5.9) {
        goodSpeakerOptions.push(option);
      } else if (quality >= 4.5) {
        badSpeakerOptions.push(option);
      } else {
        terribleSpeakerOptions.push(option);
      }
    });

    return (
      <section>

        <div className="columns is-mobile is-gapless">
          <div className="column is-two-thirds">
            <div className="control is-expanded">
              <div className="select is-fullwidth">
                <select onChange={this.changeSpeaker}>
                  <optgroup label="&mdash; Highest Quality Voices &mdash;">
                    {bestSpeakerOptions.map(option => {
                      return option;
                    })}
                  </optgroup>
                  <optgroup label="&mdash; Decent Quality Voices &mdash;">
                    {goodSpeakerOptions.map(option => {
                      return option;
                    })}
                  </optgroup>
                  <optgroup label="&mdash; Poor Quality Voices (need cleanup) &mdash;">
                    {badSpeakerOptions.map(option => {
                      return option;
                    })}
                  </optgroup>
                  <optgroup label="&mdash; Terrible Quality Voices (need rework) &mdash;">
                    {terribleSpeakerOptions.map(option => {
                      return option;
                    })}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <div className="column">
            {switchButton}
          </div>
        </div>

        <div>
          {speakerPictureOrSpectrogram}
        </div>

        <StatusText 
          statusState={this.state.statusState} 
          statusMessage={this.state.statusMessage}
          />

        <Form 
          currentSpeaker={this.props.currentSpeaker}
          currentText={this.props.currentText}
          clearStatusCallback={this.clearMessage}
          setHintMessage={this.setHintMessage}
          spectrogramMode={this.props.spectrogramMode}
          onSpeakRequestCallback={this.onSpeakRequest}
          onSpeakSuccessCallback={this.onSpeakSuccess}
          onSpeakErrorCallback={this.onSpeakError}
          onPlayCallback={this.onPlay}
          onStopCallback={this.onStop}
          updateSpectrogramCallback={this.props.changeSpectrogramCallback}
          appendUtteranceCallback={this.props.appendUtteranceCallback}
          setTextCallback={this.props.setTextCallback}
          />
      </section>
    );
  }
}

export { SpeakComponent, StatusState, ExtrasMode };
