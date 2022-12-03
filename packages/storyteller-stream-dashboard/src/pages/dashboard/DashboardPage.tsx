import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import { MustBeLoggedInView } from "../../layout/MustBeLoggedInView";
import { StorytellerUrlConfig } from "@storyteller/components/src/urls/StorytellerUrlConfig";
import {
  CheckTwitchOauth,
  CheckTwitchOauthIsError,
  CheckTwitchOauthIsOk,
} from "@storyteller/components/src/api/storyteller/twitch_oauth/CheckTwitchOauth";

interface Props {
  sessionWrapper: SessionWrapper;
}

function DashboardPage(props: Props) {
  const oauthUrl = new StorytellerUrlConfig().twitchOauthEnrollRedirect();

  const [oauthTokenFound, setOauthTokenFound] = useState(false);

  const checkTwitchOauth = useCallback(async () => {
    const result = await CheckTwitchOauth();

    if (CheckTwitchOauthIsOk(result)) {
      setOauthTokenFound(result.oauth_token_found);
    } else if (CheckTwitchOauthIsError(result)) {
    }
  }, []);

  useEffect(() => {
    checkTwitchOauth();
  }, [checkTwitchOauth]);

  let twitchText = "Link Your Twitch";

  if (oauthTokenFound) {
    twitchText = "Re-link Your Twitch";
  }

  if (!props.sessionWrapper.isLoggedIn()) {
    return (
      <>
        <MustBeLoggedInView />
      </>
    );
  }

  return (
    <div>
      <div className="py-lg-5" id="dashboard">
        <div className="container d-flex flex-column align-items-center pt-5">
          <h1 className="fw-bold pt-5">
            <span className="word">Dashboard</span>
          </h1>
          <div className="features-section">
            <div className="row gy-5">
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel">
                  <FontAwesomeIcon
                    icon={faTwitch}
                    className="features-icon purple-glow twitch-color dashboard-icon"
                  />
                  <h4 className="features-title mb-3">{twitchText}</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <a
                    href={oauthUrl}
                    className="btn btn-primary w-100 twitch-btn"
                  >
                    {twitchText}
                  </a>
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel">
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    className="features-icon red-glow dashboard-icon icon-red"
                  />
                  <h4 className="features-title mb-3">Configure TTS</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <Link to="/tts_configs" className="btn btn-primary w-100">
                    Setup TTS
                  </Link>
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-stretch">
                <div className="panel features-panel">
                  <FontAwesomeIcon
                    icon={faVideo}
                    className="features-icon red-glow dashboard-icon icon-red"
                  />
                  <h4 className="features-title mb-3">OBS Setup</h4>
                  <p className="mb-4">
                    Morbi dapibus commodo porta. Sed faucibus tristique orci in
                    tristique. Praesent quam nunc, fermentum eu feugiat sit.
                  </p>
                  <Link to="/obs_configs" className="btn btn-primary w-100">
                    Setup OBS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 py-5">
        <div className="container mb-3 d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center align-items-center gap-4">
            <img className="rotateimg180" src="assets/title-shape.png" alt="" />
            <h6 className="pre-heading text-center fw-bold pt-2">
              Got questions?
            </h6>
            <img src="assets/title-shape.png" alt="" />
          </div>
          <h1 className="fw-bold mb-4 mt-3">
            <span className="word">Join Our Community</span>
          </h1>
          <p className="lead text-center mb-5">
            We're happy to answer your questions if you have any.
            <br />
            Please join us in Discord so that we know what you're thinking.
          </p>
          <div className="d-flex flex-column flex-lg-row gap-3 mb-5">
            <button className="btn btn-secondary">
              <FontAwesomeIcon icon={faTwitter} className="me-2" />
              Follow on Twitter
            </button>
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faDiscord} className="me-2" />
              Join our Discord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DashboardPage };
