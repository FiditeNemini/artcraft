import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitch } from "@fortawesome/free-brands-svg-icons";
import {
  CheckTwitchOauth,
  CheckTwitchOauthIsError,
  CheckTwitchOauthIsOk,
} from "@storyteller/components/src/api/storyteller/twitch_oauth/CheckTwitchOauth";
import { StorytellerUrlConfig } from "@storyteller/components/src/urls/StorytellerUrlConfig";
import { faExternalLinkAlt, faPlus } from "@fortawesome/free-solid-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ObsConfigsPage(props: Props) {
  const [maybeTwitchUsername, setMaybeTwitchUsername] = useState("");

  const checkTwitchOauth = useCallback(async () => {
    const result = await CheckTwitchOauth();

    if (CheckTwitchOauthIsOk(result)) {
      setMaybeTwitchUsername(result.maybe_twitch_username || "");
    } else if (CheckTwitchOauthIsError(result)) {
    }
  }, []);

  useEffect(() => {
    checkTwitchOauth();
  }, [checkTwitchOauth]);

  if (!props.sessionWrapper.isLoggedIn()) {
    return <h1>Must Log In</h1>;
  }

  const username = !!maybeTwitchUsername
    ? maybeTwitchUsername
    : "YOUR_USERNAME";

  const obsUrl = new StorytellerUrlConfig().obsPageFortwitch(username);

  return (
    <div>
      <div className="pt-5 container">
        <h1 className="fw-bold mt-5 pt-lg-5">
          <span className="word">OBS Setup</span>
        </h1>
        <h3>Ready to Broadcast!</h3>
      </div>

      <div className="container pt-5 d-flex flex-column gap-3">
        <h2 className="fw-bold">Your OBS Browser Source</h2>
        <div className="panel p-3 p-lg-4">
          <p className="pb-3">
            Once you've linked Twitch with Storyteller, you can add the
            following page as an <em>OBS Browser Source</em>:
          </p>
          <div className="form-group">
            <div className="input-icon">
              <span className="form-control-feedback">
                <FontAwesomeIcon icon={faDiscord} />
              </span>
              <input
                className="form-control"
                type="text"
                value={obsUrl}
                readOnly={true}
              />
            </div>
            <a
              href={obsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary w-100 mt-4"
            >
              Open In New Tab
              <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-2" />
            </a>
          </div>
        </div>

        <h2 className="fw-bold mt-4">Setup Instructions</h2>
        <div className="panel p-3 p-lg-4">
          <div className="d-flex flex-column gap-3">
            <p>
              If you're not familiar with OBS or you need a refresher, here's a
              quick glance at the setup.
            </p>

            <h2 className="fw-bold mt-4">
              Step 1) Click <FontAwesomeIcon icon={faPlus} /> to add a new
              Browser Source
            </h2>

            <img
              src="/obs-tutorial/obs-step1.webp"
              className="img-thumbnail"
              alt="step 1"
            />

            <p>
              The bottom of OBS should have a plus icon (
              <FontAwesomeIcon icon={faPlus} />) to add new sources. You'll want
              to add a new <strong>Browser Source</strong>.
            </p>

            <h2 className="fw-bold mt-4">
              Step 2) Paste the URL into the configuration window
            </h2>

            <img
              src="/obs-tutorial/obs-step2.webp"
              className="img-thumbnail"
              alt="step 2"
            />

            <p>
              Remember, the URL is <code>{obsUrl}</code>
            </p>

            <h2 className="fw-bold mt-4">Step 3) Activate the Page</h2>

            <img
              src="/obs-tutorial/obs-step3.webp"
              className="img-thumbnail"
              alt="step 3"
            />

            <p>
              Right click the layer and select <em>&ldquo;Interact&rdquo;</em>.
              This will let you click the button and activate the service.
            </p>

            <h2 className="fw-bold mt-4">
              Good to go! <FontAwesomeIcon icon={faTwitch} />
            </h2>

            <p>
              You can now hide the layer and make it invisible. The audio levels
              are also independently adjustable.
            </p>

            <p>
              Have fun! We'll be back soon with some even more jaw-dropping
              utilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ObsConfigsPage };
