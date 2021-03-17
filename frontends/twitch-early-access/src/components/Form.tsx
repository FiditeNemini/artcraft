import React from 'react';
import Howl from 'howler';
import { Speaker } from '../model/Speaker';
import { SpeakRequest } from '../api/ApiDefinition';
import ApiConfig from '../api/ApiConfig';
import { Utterance } from '../model/Utterance';

interface Props {
  currentText: string,
  currentSpeaker?: Speaker,
  speakers: Speaker[],
  apiConfig: ApiConfig,
  changeSpeakerBySlug: (speakerSlug: string) => void,
  changeText: (text: string) => void,
  addUtteranceCallback: (utterance: Utterance) => void,
}

interface State {
}

class Form extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  changeSpeaker = (ev: React.FormEvent<HTMLSelectElement>) => {
    const speakerSlug = (ev.target as HTMLInputElement).value;
    this.props.changeSpeakerBySlug(speakerSlug);
  }

  changeText = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).value;
    this.props.changeText(value);
  }

  makeRequest = (ev: React.FormEvent<HTMLFormElement>) => {
    const that = this;
    console.log("Form Submit");

    if (!this.props.currentText) {
      return;
    }

    if (this.props.currentSpeaker === undefined) {
      return;
    }

    const speaker = this.props.currentSpeaker;
    const text = this.props.currentText;

    let request = new SpeakRequest(text, speaker!.slug);

    const url = this.props.apiConfig.getEndpoint('/speak');

    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);

      console.log('download at the audio url:');
      console.log(url);

      const sound = new Howl.Howl({
        src: [url],
        format: ['wav'],
      });
      
      this.setState({howl: sound});
      sound.play();

      const utterance = new Utterance(speaker, text, url, sound);
      that.props.addUtteranceCallback(utterance);
    });

    ev.preventDefault();
    return false;
  }


  public render() {
    let speakerOptions : any = [];

    this.props.speakers.forEach((speaker) => {
      speakerOptions.push(<option value={speaker.slug} key={speaker.slug}>{speaker.name}</option>)
    });

    return (
      <div className="box">
        <form onSubmit={this.makeRequest}>
          <div className="field">
            <label className="label">Speaker</label>
            <div className="control">
              <div className="select">
                <select onChange={this.changeSpeaker}>
                  {speakerOptions}
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Text</label>
            <div className="control">
              <input 
                onChange={this.changeText}
                className="input is-large" 
                type="text" 
                placeholder="TTS" 
                />
            </div>
          </div>
          
          <button className="button is-primary is-large">Submit</button>
        </form>
      </div>
    );
  }
}

export { Form };
