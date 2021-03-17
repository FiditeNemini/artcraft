import './App.css';

import React from 'react';
import { ComponentFrame, ShowComponent } from './components/ComponentFrame';
import ApiConfig from './api/ApiConfig';

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

  public updateText(text: string) {
  }

  public render() {
    return <ComponentFrame 
      showComponent={this.state.showComponent}
      apiConfig={this.state.apiConfig}
      text={this.state.text}
      updateTextCallback={this.updateText}
      />
  }
}

export default App;
