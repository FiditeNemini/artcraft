import './App.scss';
import React from 'react';
import { Footer } from './navigation/Footer';
import { HelpWantedComponent } from './modes/help_wanted/HelpWantedComponent';
import { Mode } from './AppMode';
import { NewsComponent } from './modes/news/NewsComponent';
import { SpeakComponent } from './modes/speak/SpeakComponent';
import { TermsComponent } from './modes/terms/TermsComponent';
import { TopNav } from './navigation/TopNav';
import { UsageComponent } from './modes/usage/UsageComponent';
import { Speaker, SPEAKERS } from './Speakers';

interface Props {}

interface State {
  mode: Mode,
  speaker: Speaker,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: Mode.SPEAK_MODE,
      speaker: SPEAKERS[0],
    };
  }

  switchMode = (mode: Mode) => {
    this.setState({ mode: mode });
  }

  resetMode = () => {
    this.setState({ mode: Mode.SPEAK_MODE });
  }

  setSpeaker = (speaker: Speaker) : void => {
    this.setState({ speaker: speaker });
  }

  setSpeakerBySlug = (speakerSlug: string) : void => {
    console.log('speaker', speakerSlug);
    SPEAKERS.forEach(speaker => {
      if (speaker.slug == speakerSlug) {
        this.setState({ speaker: speaker });
      }
    })
  }

  public render() {
    let component;
    switch (this.state.mode) {
      case Mode.SPEAK_MODE:
        component = <SpeakComponent currentSpeaker={this.state.speaker} changeSpeakerCallback={this.setSpeakerBySlug} />;
        break;
      case Mode.USAGE_MODE:
        component = <UsageComponent resetModeCallback={this.resetMode} />;
        break;
      case Mode.NEWS_MODE:
        component = <NewsComponent resetModeCallback={this.resetMode} />;
        break;
      case Mode.HELP_WANTED_MODE:
        component = <HelpWantedComponent resetModeCallback={this.resetMode} />;
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

export default App;
