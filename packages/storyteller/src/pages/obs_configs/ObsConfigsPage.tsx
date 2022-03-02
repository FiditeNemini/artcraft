import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { CheckTwitchOauth, CheckTwitchOauthIsError, CheckTwitchOauthIsOk } from '@storyteller/components/src/api/storyteller/twitch_oauth/CheckTwitchOauth';
import { StorytellerUrlConfig } from '@storyteller/components/src/urls/StorytellerUrlConfig';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ObsConfigsPage(props: Props) {
  const [maybeTwitchUsername, setMaybeTwitchUsername] = useState("");

  const checkTwitchOauth = useCallback(async () => {
    const result = await CheckTwitchOauth();

    if (CheckTwitchOauthIsOk(result)) {
      setMaybeTwitchUsername(result.maybe_twitch_username || "");
    } else if (CheckTwitchOauthIsError(result))  {
    }
  }, []);

  useEffect(() => {
    checkTwitchOauth();
  }, [])


  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  const username = !!maybeTwitchUsername ? maybeTwitchUsername : 'YOUR_USERNAME';

  const obsUrl = new StorytellerUrlConfig().obsPageFortwitch(username);

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

          <a
            href={obsUrl}
            target="_blank"
            rel="noreferrer"
            className="button is-large is-info is-fullwidth"
            >
              Open In New Tab&nbsp;<FontAwesomeIcon icon={faExternalLinkAlt} />
          </a>

          <br />

          <p>This page is a work in progress! It will include instructions, more configs, etc.</p>

        </div>
      </section>

    </div>
  )
}

export { ObsConfigsPage }