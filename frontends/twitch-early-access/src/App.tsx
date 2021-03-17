import './App.css';

import React from 'react';
import { ComponentFrame, ShowComponent } from './components/ComponentFrame';
import ApiConfig from './api/ApiConfig';
import ModeButtons from './components/ModeButtons';
import { SpeakerDetails } from './api/ApiDefinition';
import { SpeakerDropdown } from './components/SpeakerDropdown';
import { Speaker } from './model/Speaker';

interface Props {
}

interface State {
  showComponent: ShowComponent,
  apiConfig: ApiConfig,
  speakers: Speaker[],
  currentText: string,
  currentSpeaker?: Speaker;
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      showComponent: ShowComponent.SPEAK,
      apiConfig: new ApiConfig(),
      speakers: [],
      currentText: "",
    };
  }

  componentDidMount() {
    this.loadSpeakers();
  }

  public loadSpeakers() {
    const url = this.state.apiConfig.getEndpoint('/speakers');

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

  switchComponent = (showComponent: ShowComponent) => {
    this.setState({
      showComponent: showComponent,
    });
  }

  public render() {
    return (
      <div>
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
        <SpeakerDropdown
          speakers={this.state.speakers}
          currentSpeaker={this.state.currentSpeaker}
          />
      </div>
    );
  }
}

export default App;
