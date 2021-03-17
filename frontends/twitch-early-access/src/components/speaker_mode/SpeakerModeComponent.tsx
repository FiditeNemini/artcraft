import React from 'react';
import { SpeakerDetails, SpeakerResponse } from './SpeakerResponse';
import { SpeakerDropdownComponent } from './SpeakerDropdownComponent';
import SpeakerAudioForm from './SpeakerAudioForm';
import ApiConfig from '../../api/ApiConfig';

interface Props {
  apiConfig: ApiConfig,
  text: string,
  updateTextCallback: (text: string) => void,
}

interface State {
  speaker_response?: SpeakerResponse,
  speaker_slug?: string,
}

class SpeakerModeComponent extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      speaker_response: undefined,
      speaker_slug: undefined,
    };
  }

  componentDidMount() {
    this.loadSpeakers();
  }

  public loadSpeakers() {
    const url = this.props.apiConfig.getEndpoint('/voices');
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          console.log('loaded speakers', result);
          let first_speaker = result.speakers[0].slug;
          this.setState({
            speaker_response: result,
            speaker_slug: first_speaker,
          })
        }
      );
  }

  changeSpeaker = (ev: React.FormEvent<HTMLSelectElement>) => {
    const speakerSlug = (ev.target as HTMLInputElement).value;
    this.setState({
      speaker_slug: speakerSlug,
    })
  }

  public render() {
    let speakers = this.state.speaker_response?.speakers;
    let dropdown;

    if (speakers?.length || 0 > 0) {
      dropdown = <SpeakerDropdownComponent 
        speakers={speakers!} 
        changeCallback={this.changeSpeaker}
        />
    }

    return (
      <div>
        <b>SpeakerMode</b>
        {dropdown}
        <SpeakerAudioForm 
          speaker={this.state.speaker_slug!} 
          apiConfig={this.props.apiConfig}
          text={this.props.text}
          updateTextCallback={this.props.updateTextCallback}
          />
      </div>
    );
  }
}

export {SpeakerModeComponent};
