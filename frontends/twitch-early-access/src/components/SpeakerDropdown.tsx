import React from 'react';
import { Speaker } from '../model/Speaker';

interface Props {
  currentSpeaker?: Speaker,
  speakers: Speaker[],
  changeSpeakerBySlug: (speakerSlug: string) => void,
}

interface State {
}

class SpeakerDropdown extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  changeSpeaker = (ev: React.FormEvent<HTMLSelectElement>) => {
    const speakerSlug = (ev.target as HTMLInputElement).value;
    this.props.changeSpeakerBySlug(speakerSlug);
  }

  public render() {
    let speakerOptions : any = [];

    this.props.speakers.forEach((speaker) => {
      speakerOptions.push(<option value={speaker.slug}>{speaker.name}</option>)
    });

    return (
      <select onChange={this.changeSpeaker}>
        {speakerOptions}
      </select>
    );
  }
}

export { SpeakerDropdown };
