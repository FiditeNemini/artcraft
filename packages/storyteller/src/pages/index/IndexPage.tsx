import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { faCogs, faVideo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FakeYouExternalLink } from '@storyteller/components/src/elements/FakeYouExternalLink';
import React from 'react';
import { Link } from 'react-router-dom';

function IndexPage() {
  return (
    <div>

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose6_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title">
                Storyteller
              </p>
              <p className="subtitle">
                Supercharge your Stream
              </p>

              <p>
                Storyteller is a new platform built by the creators of the&nbsp; 
                <FakeYouExternalLink>FakeYou deep fake website</FakeYouExternalLink>. We're
                building virtual and deepfake production tools for your home studio. 
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">

          <div className="content">
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