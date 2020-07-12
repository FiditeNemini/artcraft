import './App.scss';
import React from 'react';
import { AboutComponent } from './modes/about/AboutComponent';
import { ExtrasMode } from './modes/speak/extras/ExtrasComponent';
import { Footer } from './navigation/Footer';
import { HistoryComponent } from './modes/history/HistoryComponent';
import { Mode } from './AppMode';
import { SpeakComponent } from './modes/speak/SpeakComponent';
import { Speaker, SPEAKERS } from './model/Speakers';
import { Spectrogram } from './modes/speak/extras/Spectrogram';
import { TermsComponent } from './modes/terms/TermsComponent';
import { TopNav } from './navigation/TopNav';
import { Utterance } from './model/utterance';

interface Props {}

enum SpectrogramMode {
  VIRIDIS,
  CIVIDIS,
  PLASMA,
  INFERNO,
  MAGMA,
  GIST_HEAT,
  AFMHOT,
  PINK,
  BLACK_WHITE,
  BONE,
  COPPER,
  JET,
  RDBU,
  RDGY,
  SPRING,
  COOL,
}

interface State {
  mode: Mode,
  extrasMode: ExtrasMode,
  speaker: Speaker,
  currentSpectrogram?: Spectrogram,
  spectrogramMode: SpectrogramMode,
  utterances: Utterance[],
  currentText: string,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: Mode.SPEAK_MODE,
      extrasMode: ExtrasMode.SPEAKER_INFO,
      speaker: SPEAKERS[0],
      spectrogramMode: SpectrogramMode.VIRIDIS,
      utterances: [],
      currentText: '',
    };
  }

  switchMode = (mode: Mode) => {
    this.setState({ mode: mode });
  }

  resetMode = () => {
    this.setState({ mode: Mode.SPEAK_MODE });
  }

  switchExtrasMode = (extrasMode: ExtrasMode) => {
    this.setState({ extrasMode: extrasMode });
  }

  setSpeaker = (speaker: Speaker) : void => {
    this.setState({ speaker: speaker });
  }

  setSpeakerBySlug = (speakerSlug: string) : void => {
    let selectedSpeaker = undefined;

    SPEAKERS.forEach(speaker => {
      if (speaker.slug === speakerSlug) {
        selectedSpeaker = speaker;
      }
    })

    if (selectedSpeaker !== undefined) {
      this.setState({ 
        speaker: selectedSpeaker,
        extrasMode: ExtrasMode.SPEAKER_INFO,
      });
    }
  }

  updateSpectrogram = (spectrogram: Spectrogram) => {
    this.setState({ 
      currentSpectrogram: spectrogram,
      extrasMode: ExtrasMode.SPECTROGRAM,
    });
  }

  setSpectrogramMode = (spectrogramMode: SpectrogramMode) : void => {
    this.setState({ spectrogramMode: spectrogramMode });
  }

  appendUtterance = (utterance: Utterance) => {
    let utterances = this.state.utterances.slice();
    utterances.unshift(utterance);
    this.setState({ utterances: utterances });
  }

  setText = (text: string) => {
    this.setState({ currentText : text });
  }

  public render() {
    let component;
    switch (this.state.mode) {
      case Mode.SPEAK_MODE:
        component = <SpeakComponent 
          extrasMode={this.state.extrasMode}
          currentSpeaker={this.state.speaker} 
          currentSpectrogram={this.state.currentSpectrogram}
          currentText={this.state.currentText}
          changeSpeakerCallback={this.setSpeakerBySlug} 
          changeSpectrogramCallback={this.updateSpectrogram} 
          changeExtrasModeCallback={this.switchExtrasMode}
          spectrogramMode={this.state.spectrogramMode}
          changeSpectrogramMode={this.setSpectrogramMode}
          appendUtteranceCallback={this.appendUtterance}
          setTextCallback={this.setText}
          />;
        break;
      case Mode.HISTORY_MODE:
        component = <HistoryComponent utterances={this.state.utterances} />
        break;
      case Mode.ABOUT_MODE:
        component = <AboutComponent resetModeCallback={this.resetMode} />;
        break;
      case Mode.TERMS_MODE:
        component = <TermsComponent resetModeCallback={this.resetMode} />;
        break;
    }
    return (
      <div id="main">
        <div id="viewable">
          <TopNav mode={this.state.mode} switchModeCallback={this.switchMode} />
          {component}
        </div>
        <Footer mode={this.state.mode} switchModeCallback={this.switchMode} />
      </div>
    );
  }
}

export { App, SpectrogramMode };
