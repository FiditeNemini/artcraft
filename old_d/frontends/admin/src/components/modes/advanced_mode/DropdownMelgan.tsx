import React from 'react';
import { ModelDetails } from './ModelResponse';

interface Props {
  callback: (ev: React.FormEvent<HTMLSelectElement>) => void,
  model_details: ModelDetails[]
}

interface State {
}

class DropdownMelgan extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    return (
      <select onChange={this.props.callback}>
        {this.props.model_details.map(function(model_details: ModelDetails) {
          let file_path : string = model_details.file_path || "unknown";
          let base_name : string = model_details.base_name || "unknown";
          return (<option value={file_path}>{base_name}</option>)
        })};
      </select>
    );
  }
}

export {DropdownMelgan};
