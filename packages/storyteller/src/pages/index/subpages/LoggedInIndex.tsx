import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faVideo } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faTwitch } from '@fortawesome/free-brands-svg-icons';
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { StorytellerUrlConfig } from '@storyteller/components/src/urls/StorytellerUrlConfig';

function LoggedInIndex() {
  const oauthUrl = new StorytellerUrlConfig().twitchOauthEnrollRedirect();

  return (
    <div>

      <section className="section">
        <div className="container">

          <a
            href={oauthUrl}
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
            to="/obs_configs"
            className="button is-large is-info is-fullwidth"
            >
              Configure OBS&nbsp;<FontAwesomeIcon icon={faVideo} />
          </Link>

        </div>

        <br />
        <br />

        <div className="content">
          <h1 className="title is-3"> <FontAwesomeIcon icon={faDiscord} /> Join us in Discord! </h1>
          <h2 className="subtitle is-5">
            We'd like to chat with you.
          </h2>
          <p>
            <DiscordLink text="Please join us in Discord" iconAfterText={true} /> so that we know 
            what you're thinking.
          </p>
        </div>

      </section>

    </div>
  )
}

export { LoggedInIndex }