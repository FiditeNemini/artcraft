import './App.css';

import React from 'react';
import { ComponentFrame, ShowComponent } from './components/ComponentFrame';
import ApiConfig from './api/ApiConfig';
import ModeButtons from './components/ModeButtons';

interface Props {
}

interface State {
  showComponent: ShowComponent,
  apiConfig: ApiConfig,
  text: string,
}

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      showComponent: ShowComponent.SPEAK,
      apiConfig: new ApiConfig(),
      text: "",
    };
  }

  updateText = (text: string) => {
    this.setState({
      text: text,
    });
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
          text={this.state.text}
          updateTextCallback={this.updateText}
          />
      </div>
    );
  }
}

export default App;
