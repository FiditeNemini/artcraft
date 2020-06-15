import Howl from 'howler';
import React from 'react';
import { SpeakRequest } from './SpeakRequest';
import { Speaker } from '../../Speakers';


interface Props {
  currentSpeaker: Speaker,
  clearStatusCallback: () => void,
  setHintMessage: (message: string) => void,
  onSpeakRequestCallback: () => void,
  onSpeakSuccessCallback: () => void,
  onSpeakErrorCallback: () => void,
  onPlayCallback: () => void,
  onStopCallback: () => void,
}

interface State {
  text: string,
  howl?: Howl,
}

class Form extends React.Component<Props, State> {

  textarea: HTMLTextAreaElement | null | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      text: '',
    };
  }

  componentDidMount() {
    this.textarea?.focus();
  }

  public speak(sentence: string, speaker: string) {
    let request = new SpeakRequest(sentence, speaker);

    console.log("Making SpeakRequest:", request);

    //const url = this.props.apiConfig.getEndpoint('/speak');
    const url = 'https://mumble.stream/speak';

    this.props.onSpeakRequestCallback();
    let that = this;

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
      this.props.onSpeakSuccessCallback();

      console.log(blob);

      const url = window.URL.createObjectURL(blob);
      console.log(url);

      const sound = new Howl.Howl({
        src: [url],
        format: 'wav',
        // NB: Attempting to get this working on iPhone Safari
        // https://github.com/goldfire/howler.js/issues/1093
        // Other issues cite needing to cache a single player 
        // across all user interaction events.
        html5: true,
        onplay: () => {
          that.props.onPlayCallback();
        },
        onend: () => {
          that.props.onStopCallback();
        },
      });
      
      this.setState({howl: sound});
      sound.play();

      (window as any).sound = sound;
    })
    .catch(e => {
      this.props.onSpeakErrorCallback();
    });
  }

  clear() {
    this.setState({text: ''});
  }

  handleTextChange = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const text = (ev.target as HTMLTextAreaElement).value;

    let pseudoWords = text.split(' ');

    if (text.length > 0) {
      if (pseudoWords.length > 0 && pseudoWords.length < 4) {
        this.props.setHintMessage("Hint: It sounds better when you type more words.");
      } else if (pseudoWords.length > 5) {
        this.props.setHintMessage("Hint: Use the ESC key to clear if you're on your computer.");
      }
    } else {
      this.props.clearStatusCallback();
    }

    this.setState({text: text});
  }

  handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();
    let speaker = this.props.currentSpeaker.getSlug();
    this.speak(this.state.text, speaker);
    return false;
  }

  handleCancelClick = (ev: React.FormEvent<HTMLButtonElement>) : boolean => {
    ev.preventDefault();
    this.clear();
    return false;
  }

  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) : boolean => {
    if (ev.keyCode === 27) {
      // Escape key
      this.clear();
    }
    return true;
  }

  public render() {
    return (
      <form onSubmit={this.handleFormSubmit}>
        <textarea 
          onChange={this.handleTextChange} 
          onKeyDown={this.handleKeyDown}
          value={this.state.text} 
          ref={(textarea) => { this.textarea = textarea; }} 
          />
        <div>
          <div className="left">
            <button>Speak</button>
          </div>
          <div className="right">
            <button onClick={this.handleCancelClick}>Cancel</button>
          </div>
          <div className="clear"></div>
        </div>
      </form>
    );
  }
}

export { Form };
