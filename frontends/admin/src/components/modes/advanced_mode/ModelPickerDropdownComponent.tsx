import React from 'react';
import { ModelResponse, ModelDetails } from './ModelResponse';
import { DropdownMelgan } from './DropdownMelgan';
import { DropdownArpabetTacotron } from './DropdownArpabetTacotron';
import ApiConfig from '../../../ApiConfig';

interface Props {
  apiConfig: ApiConfig,
  changeArpabetTacotronCallback: (ev: React.FormEvent<HTMLSelectElement>) => void,
  changeMelganCallback: (ev: React.FormEvent<HTMLSelectElement>) => void,
}

interface State {
  models?: ModelResponse,
}

class ModelPickerDropdownComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      models: undefined,
    };
  }

  componentDidMount() {
    this.loadModels();
  }

  public loadModels() {
    const url = this.props.apiConfig.getEndpoint('/models');
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          const models = result;
          this.setState({
            models: models,
          })
        }
      );
  }

  public render() {
    let arpabet_tacotron_models : ModelDetails[] = this.state.models?.tacotron || [];
    let melgan_models : ModelDetails[] = this.state.models?.melgan || [];
    return (
      <div>
        <h3>Tacotron (Arpabet)</h3>
        <DropdownArpabetTacotron 
          model_details={arpabet_tacotron_models} 
          callback={this.props.changeArpabetTacotronCallback}
          />
        <h3>Melgan</h3>
        <DropdownMelgan 
          model_details={melgan_models} 
          callback={this.props.changeMelganCallback}
          />
      </div>
    );
  }
}

export {ModelPickerDropdownComponent};
