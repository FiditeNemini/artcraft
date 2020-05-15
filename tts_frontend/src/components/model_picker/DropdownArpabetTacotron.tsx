import React from 'react';
import { ModelDetails } from './ModelResponse';

interface Props {
  callback: (ev: React.FormEvent<HTMLSelectElement>) => void,
  model_details: ModelDetails[]
}

interface State {
}

class DropdownArpabetTacotron extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    return (
      <select onChange={this.props.callback}>
        {this.props.model_details.map(function(model_details: ModelDetails) {
          let file : string = model_details.file || "unknown";
          return (<option value={file}>{file}</option>)
        })};
      </select>
    );
  }
}

export {DropdownArpabetTacotron};
