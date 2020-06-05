import ApiConfig from '../ApiConfig';
import React from 'react';
import { ModeSelector } from './ModeSelector';
import { SentencesComponent } from './sentences/SentencesComponent'

enum Mode {
  SPEAKER,
  ADVANCED,
  SENTENCE,
}

interface Props {
  apiConfig: ApiConfig,
}

interface State {
  mode: Mode,
}

class ModalComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      mode: Mode.SPEAKER,
    };
  }

  switchMode = (mode: Mode) => {
    console.log('switchMode', mode, this);
    this.setState({ mode: mode });
  }

  public render() {
    let component;

    switch (this.state.mode) {
      case Mode.SPEAKER:
        break;
      case Mode.ADVANCED:
        break;
      case Mode.SENTENCE:
        component = <SentencesComponent apiConfig={this.props.apiConfig} />;
        break;
    }
    
    return (
      <div>
        <ModeSelector mode={this.state.mode} switchModeCallback={this.switchMode} />
        <hr />
        {component}
      </div>
    );
  }
}

export { ModalComponent, Mode };
