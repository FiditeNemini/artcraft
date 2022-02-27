import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ObsConfigsPage(props: Props) {

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  const obsUrl = 'https://obs.storyteller.io/twitch/YOUR_USERNAME';

  return (
    <div>

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose5_black_2000.webp" alt="FakeYou's mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title is-1">
                OBS Setup
              </p>
              <p className="subtitle is-3">
                Ready to Broadcast! 
              </p>

            </div>

          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">

          <p>Once you've linked Twitch with Storyteller, you can open the following page in OBS:</p>

          <br />

          <div className="field">
            <p className="control has-icons-left">
              <input className="input is-large" type="text" value={obsUrl} readOnly={true} />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faDiscord} />
              </span>
            </p>
          </div>

          <br />

          <p>This page is a work in progress! It will include instructions, more configs, etc.</p>

        </div>
      </section>

    </div>
  )
}

export { ObsConfigsPage }