
import React from 'react';
import { SpeakerResponse, SpeakerDetails } from './SpeakerResponse';

interface Props {
  changeCallback: (ev: React.FormEvent<HTMLSelectElement>) => void,
  speakers: SpeakerDetails[]
}

interface State {
}

class SpeakerDropdownComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    return (
      <div>
        <strong>Select Speaker</strong>
        <br />
        <select onChange={this.props.changeCallback}>
          {this.props.speakers.map(function(speaker: SpeakerDetails) {
            let name : string = speaker.name || "unknown";
            let slug : string = speaker.slug || "unknown";
            return (<option value={slug}>{name}</option>)
          })};
        </select>
      </div>
    );
  }
}

export {SpeakerDropdownComponent};
