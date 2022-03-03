import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitch } from '@fortawesome/free-brands-svg-icons';
import { CheckTwitchOauth, CheckTwitchOauthIsError, CheckTwitchOauthIsOk } from '@storyteller/components/src/api/storyteller/twitch_oauth/CheckTwitchOauth';
import { StorytellerUrlConfig } from '@storyteller/components/src/urls/StorytellerUrlConfig';
import { faExternalLinkAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

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
  }, [checkTwitchOauth])


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

          <h1 className="title is-2">Your OBS Browser Source</h1>

          <p>Once you've linked Twitch with Storyteller, you can add the following page as an <em>OBS Browser Source</em>:</p>

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
          <br />
          <br />

          <h1 className="title is-2">Setup Instructions</h1>

          <p>If you're not familiar with OBS or you need a refresher, here's a quick glance at the setup.</p>  

          <br />

          <h1 className="title is-4">Step 1) Click <FontAwesomeIcon icon={faPlus} /> to add a new Browser Source</h1>

          <img src="/obs-tutorial/obs-step1.webp" />

          <p>The bottom of OBS should have a plus icon (<FontAwesomeIcon icon={faPlus} />) to add new sources. 
          You'll want to add a new <strong>Browser Source</strong>.</p>

          <br />

          <h1 className="title is-4">Step 2) Paste the URL into the configuration window</h1>

          <img src="/obs-tutorial/obs-step2.webp" />

          <br />

          <p>Remember, the URL is <code>{obsUrl}</code></p>
          
          <br />

          <h1 className="title is-4">Step 3) Activate the Page</h1>

          <img src="/obs-tutorial/obs-step3.webp" />

          <br />
          <br />

          <p>Right click the layer and select <em>&ldquo;Interact&rdquo;</em>. 
          This will let you click the button and activate the service.</p>

          <br />
          <br />

          <h1 className="title is-2">Good to go! <FontAwesomeIcon icon={faTwitch} /></h1>

          <p>You can now hide the layer and make it invisible. The audio levels are also independently adjustable.</p>

          <br />

          <p>Have fun! We'll be back soon with some even more jaw-dropping utilities.</p>
        </div>
      </section>

    </div>
  )
}

export { ObsConfigsPage }