import React from 'react';
import { Speaker } from '../model/Speaker';

interface Props {
  currentSpeaker?: Speaker,
  speakers: Speaker[],
}

interface State {
}

class SpeakerDropdown extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public updateText(text: string) {
  }

  public render() {
    let speakerOptions : any = [];

    this.props.speakers.forEach((speaker) => {
      speakerOptions.push(<option value={speaker.slug}>{speaker.name}</option>)
    });

    return (
      <select>
        {speakerOptions}
      </select>
    );
  }
}

export { SpeakerDropdown };
