import 'bulma/css/bulma.css'
import './App.css';

import React from 'react';
import { ShowComponent } from './components/ComponentFrame';
import ApiConfig from './api/ApiConfig';
import { SpeakerDetails } from './api/ApiDefinition';
import { Form } from './components/Form';
import { Speaker } from './model/Speaker';
import { Utterance } from './model/Utterance';
import { UtteranceHistory } from './components/UtteranceHistory';

interface Props {
}

interface State {
  showComponent: ShowComponent,
  apiConfig: ApiConfig,
  speakers: Speaker[],
  currentText: string,
  currentSpeaker?: Speaker;
  pastUtterances: Utterance[],
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      showComponent: ShowComponent.SPEAK,
      apiConfig: new ApiConfig(),
      speakers: [],
      currentText: "",
      pastUtterances: [],
    };
  }

  componentDidMount() {
    this.loadSpeakers();
  }

  public loadSpeakers() {
    const url = this.state.apiConfig.getEndpoint('/voices');

    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          console.log('loaded speakers', result);

          let speakers = result.speakers.map((speakerDetails : SpeakerDetails) => {
            return new Speaker(speakerDetails.name!, speakerDetails.slug!);
          })

          this.setState({
            speakers: speakers,
            currentSpeaker: speakers[0],
          })
        }
      );
  }

  updateText = (text: string) => {
    this.setState({
      currentText: text,
    });
  }

  updateSpeaker = (speaker: Speaker) => {
    this.setState({
      currentSpeaker: speaker,
    })
  }

  updateSpeakerBySlug = (speakerSlug: string) => {
    const maybeSpeaker = this.state.speakers.find(speaker => {
      return speaker.slug === speakerSlug;
    })
    this.setState({
      currentSpeaker: maybeSpeaker,
    })
  }

  switchComponent = (showComponent: ShowComponent) => {
    this.setState({
      showComponent: showComponent,
    });
  }

  addUtterance = (utterance: Utterance) => {
    let utterances = this.state.pastUtterances.concat(utterance);
    this.setState({
      pastUtterances: utterances,
    })
  }

  public render() {
    return (
      <div>
        <section className="hero is-info">
          <div className="hero-body">
            <p className="title">
              Vo.codes Early Access
            </p>
            <p className="subtitle">
              Thanks for being awesome! Use these before anyone else :)
            </p>
          </div>
        </section>

        {/* 
         === TODO ===
        <ModeButtons
          showComponent={this.state.showComponent}
          switchShowComponentCallback={this.switchComponent}
          />
        <hr />

        <ComponentFrame 
          showComponent={this.state.showComponent}
          apiConfig={this.state.apiConfig}
          currentText={this.state.currentText}
          currentSpeaker={this.state.currentSpeaker}
          updateTextCallback={this.updateText}
          />
        */}
        <Form
          apiConfig={this.state.apiConfig}
          speakers={this.state.speakers}
          currentSpeaker={this.state.currentSpeaker}
          currentText={this.state.currentText}
          changeSpeakerBySlug={this.updateSpeakerBySlug}
          changeText={this.updateText}
          addUtteranceCallback={this.addUtterance}
          />
          <section className="section is-small">
            <h1 className="title">Results</h1>
            <h2 className="subtitle">
              Your results will go here. 
              Please make make lots of YouTube videos before anyone else has access!
            </h2>
          </section>

          <UtteranceHistory 
            utterances={this.state.pastUtterances}
            />
      </div>
    );
  }
}

export default App;
