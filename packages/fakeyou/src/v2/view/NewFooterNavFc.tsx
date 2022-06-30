import React from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";

// import "./_css/footer.scss";
import { ModerationIcon } from "./_icons/ModerationIcon";
import { FrontendUrlConfig } from "../../common/FrontendUrlConfig";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPatreon,
  faTwitch,
  faDiscord,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";

interface Props {
  sessionWrapper: SessionWrapper;
}

function NewFooterNavFc(props: Props) {
  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="v2_mod_link">
        <Link to={FrontendUrlConfig.moderationMain()}>
          <ModerationIcon /> Mod Controls
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="container">
        <hr />
      </div>

      <div className="d-flex flex-column container py-5 gap-4">
        <div className="text-center align-items-center justify-content-center gap-3">
          <Link to="/">Text to Speech</Link>
          &nbsp;|&nbsp;
          <Link to="/video">Video</Link>
          &nbsp;|&nbsp;
          <Link to="/contribute">Upload</Link>
          &nbsp;|&nbsp;
          <Link to="/leaderboard">Leaderboard</Link>
          &nbsp;|&nbsp;
          <Link to={FrontendUrlConfig.patronsPage()}>Patrons</Link>
          &nbsp;|&nbsp;
          <Link to="/firehose">Feed</Link>
          &nbsp;|&nbsp;
          <a href={FrontendUrlConfig.developerDocs()}>API Docs</a>
          &nbsp;|&nbsp;
          <Link to="/about">About Us</Link>
          &nbsp;|&nbsp;
          <Link to="/terms">Terms of Use</Link>
        </div>

        <div className="d-flex justify-content-center gap-4">
          <a
            className="social-icon"
            href="https://discord.gg/H72KFXm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDiscord} className="me-2" />
          </a>
          <a
            className="social-icon"
            href="https://twitch.tv/FakeYouLabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitch} className="me-2" />
          </a>
          <a
            className="social-icon"
            href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faTwitter} className="me-2" />
          </a>
          <a
            className="social-icon"
            href="https://facebook.com/vocodes"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFacebook} className="me-2" />
          </a>
          <a
            className="social-icon"
            href="https://www.patreon.com/FakeYou"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faPatreon} className="me-2" />
          </a>
        </div>

        <div className="d-flex flex-column align-items-center gap-4">
          <div>
            <Trans i18nKey="coreUi.footerNav.builtBy">
              Built by <Link to="/profile/echelon">echelon</Link> in Atlanta.
            </Trans>
          </div>

          <GitSha />

          {moderationLink}
        </div>

        {/*<p>
          <a href="https://create.storyteller.io" target="_blank" rel="noreferrer">storyteller<sup>(alpha)</sup></a>
        </p>*/}
      </div>
    </div>
  );
}

export { NewFooterNavFc };
