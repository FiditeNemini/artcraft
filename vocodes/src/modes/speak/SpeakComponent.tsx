import React from 'react';
import { CategoryDropdown } from './dropdowns/CategoryDropdown';
import { Form } from './Form';
import { Speaker, SpeakerCategory, SPEAKERS } from '../../model/Speakers';
import { SpeakerDropdown } from './dropdowns/SpeakerDropdown';
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
  currentSpeakerCategory: SpeakerCategory,
  currentSpectrogram?: Spectrogram,
  spectrogramMode: SpectrogramMode,
  currentText: string,
  textCharacterLimit: number,
  showNewsNotice: boolean,
  changeSpeakerCallback: (slug: string) => void,
  changeSpeakerCategoryCallback: (speakerCategorySlug: string) => void,
  changeSpectrogramCallback: (spectrogram: Spectrogram) => void,
  changeExtrasModeCallback: (extrasMode: ExtrasMode) => void,
  changeSpectrogramMode: (spectrogramMode: SpectrogramMode) => void,
  appendUtteranceCallback: (utterance: Utterance) => void,
  setTextCallback: (text: string) => void,
  toggleNewsNoticeCallback: () => void,
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
    this.setMessage(StatusState.ERROR, 
      "There was an error, probably due to the volume of requests we're getting. You can retry your request again. Each voice is backed by different machines, so try other voices too. Please report this error in our Discord if you see it too frequently.");
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

  selectRandomSpeaker = () => {
    const index = Math.floor(Math.random() * SPEAKERS.length);
    const speaker = SPEAKERS[index]!;
    this.props.changeSpeakerCallback(speaker.getSlug());
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

    let newsNotice= <article />;

    if (this.props.showNewsNotice) {
      newsNotice = (
        <article className="message is-info">
          <div className="message-header">
            <p>Join our Twitch for a chance to win a PlayStation 5</p>
            <button className="delete" aria-label="delete" onClick={() => this.props.toggleNewsNoticeCallback()}></button>
          </div>
          <div className="message-body">
            <p>
              <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer">Follow us on Twitch!</a> We're
              building streaming tools that will incorporate deep fake technology and audience interaction. You'll be able
              to use this for your streams, too.
            </p>
            <p>
              We're giving away prizes with every stream. Please check us out!
            </p>
          </div>
        </article>
      );
    }

    return (
      <section>

        {newsNotice}

        <div className="columns is-mobile is-gapless">
          <div className="column">
            <CategoryDropdown
              currentSpeakerCategory={this.props.currentSpeakerCategory}
              changeSpeakerCategoryCallback={this.props.changeSpeakerCategoryCallback}
              />
          </div>
        
          <div className="column">
            <button
              className="button is-light is-info"
              onClick={this.selectRandomSpeaker}
              >Random Speaker</button>
          </div>
        </div>

        <div className="columns is-mobile is-gapless">

          <SpeakerDropdown
            currentSpeaker={this.props.currentSpeaker}
            currentSpeakerCategory={this.props.currentSpeakerCategory}
            changeSpeakerCallback={this.props.changeSpeakerCallback}
            />

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
          textCharacterLimit={this.props.textCharacterLimit}
          clearStatusCallback={this.clearMessage}
          setHintMessage={this.setHintMessage}
          spectrogramMode={this.props.spectrogramMode}
          enableSpectrograms={this.props.enableSpectrograms}
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
