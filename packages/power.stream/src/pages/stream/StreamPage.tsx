import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useHistory, withRouter } from 'react-router-dom';

function StreamPage() {
  const history = useHistory();

  const [twitchUsername, setTwitchUsername] = useState('')

  const handleTwitchUsernameChange = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const value = (ev.target as HTMLInputElement).value;
    setTwitchUsername(value);
    return false;
  };

  const openObs = (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    let url = `/obs/${twitchUsername}`;
    history.push(url);
    return false;
  };

  const buttonDisabled = twitchUsername.trim().length === 0;

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Stream TTS
          </h1>
          <p className="subtitle">
            Early Alpha Preview
          </p>
          <div className="content">
            <p>This is an early demo of our Stream TTS, powered by FakeYou. 
              It does not currently offer customization, though our plans are to 
              allow for a high degree of configurability: set your own voices, rewards, etc.</p>
              
            <p>You don't need to set up any software on your end. Simply point OBS or your 
              broadcast software the URL below:</p>

            <br />

            <button className="button is-large is-danger">
              1. Connect with Twitch
            </button>

            <br />
            <br />
            <br />

            <div className="field">
              <p className="control has-icons-left">
                <input 
                    className="input is-large" 
                    type="text" 
                    placeholder="Twitch Username" 
                    onChange={handleTwitchUsernameChange}/>
                <span className="icon is-large is-left">
                  <FontAwesomeIcon icon={faTwitch} />
                </span>
              </p>
            </div>

            <br />

            <button 
              className="button is-large is-danger"
              disabled={buttonDisabled}
              onClick={openObs}
              >
              2. Open OBS Page
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default withRouter(StreamPage);