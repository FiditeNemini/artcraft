import React from 'react';
import { Speaker, SPEAKERS } from '../../model/Speakers';

interface Props {
  currentSpeaker: Speaker;
  changeSpeakerCallback: (slug: string) => void,
}

interface State {}

class SpeakerDropdown extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  changeSpeaker = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let slug = event.target.value;
    this.props.changeSpeakerCallback(slug);
  }

  public render() {
    let options : any[] = [];

    SPEAKERS.forEach(speaker => {
      let slug = speaker.getSlug();
      options.push(<option key={slug} value={speaker.getSlug()}>{speaker.getName()}</option>);
    });

    return (
      <select onChange={this.changeSpeaker}>
        {options.map(option => {
          return option;
        })}
      </select>
    );
  }
}

export { SpeakerDropdown };
