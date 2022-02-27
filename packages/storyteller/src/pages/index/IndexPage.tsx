import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { faCogs, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import React from 'react';
import { Link } from 'react-router-dom';

function IndexPage() {
  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Storyteller
          </h1>
          <p className="subtitle">
            Supercharge your Content
          </p>

          <div className="content">
            <p>
              Storyteller is a new platform built by the creators of the&nbsp; 
              <FakeYouExternalLink>FakeYou deep fake website</FakeYouExternalLink>. We're
              building a virtual and deepfake production tools for your 
              home studio. Twitch TTS is just the first of many tools we'll be 
              offering.
            </p>
          </div>

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

export { IndexPage }