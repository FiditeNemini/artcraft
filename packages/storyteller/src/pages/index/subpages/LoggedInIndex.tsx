import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faTwitch } from '@fortawesome/free-brands-svg-icons';

function LoggedInIndex() {
  return (
    <div>

      <section className="section">
        <div className="container">

          <a
            href="https://api.jungle.horse/twitch/oauth_enroll_redirect"
            className="button is-large is-info is-fullwidth"
            >
              Link to Your Twitch&nbsp;<FontAwesomeIcon icon={faTwitch} />
          </a>

          <br />

          <Link
            to="/tts_configs"
            className="button is-large is-info is-fullwidth"
            >
              Configure TTS&nbsp;<FontAwesomeIcon icon={faCogs} />
          </Link>

          <br />

          <Link
            to="/obs_info"
            className="button is-large is-info is-fullwidth"
            >
              Configure OBS&nbsp;<FontAwesomeIcon icon={faVideo} />
          </Link>

        </div>
      </section>

    </div>
  )
}

export { LoggedInIndex }