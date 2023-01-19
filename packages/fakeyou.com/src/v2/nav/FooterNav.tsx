import React from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";

import { ModerationIcon } from "../view/_icons/ModerationIcon";
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
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import { EchelonTwitterLink } from "@storyteller/components/src/elements/EchelonTwitterLink";

interface Props {
  sessionWrapper: SessionWrapper;
}

function FooterNav(props: Props) {
  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="v2_mod_link mb-4 mb-lg-0 me-0 me-lg-4">
        <Link to={FrontendUrlConfig.moderationMain()}>
          <ModerationIcon />
          <span className="ms-2">Mod Controls</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <footer id="footer">
        <div className="container py-5">
          {/* <div className="pb-4">
            <hr />
          </div> */}

          <div className="row gx-5 gy-5">
            <div className="col-12 col-lg-3 d-flex flex-column gap-4 align-items-center align-items-lg-start">
              <Link to="/">
                <img
                  src="/fakeyou/FakeYou-Logo.png"
                  alt="FakeYou: Cartoon and Celebrity Text to Speech"
                  height="38"
                />
              </Link>
              <div className="d-flex gap-3">
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Join our Discord Server"
                >
                  <FontAwesomeIcon icon={faDiscord} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href="https://twitch.tv/FakeYouLabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Subscribe to our Twitch Channel"
                >
                  <FontAwesomeIcon icon={faTwitch} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_TWITTER_WITH_FOLLOW_INTENT}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href="https://facebook.com/vocodes"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Like us on Facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} className="me-2" />
                </a>
                <a
                  className="social-icon"
                  href={ThirdPartyLinks.FAKEYOU_PATREON}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Support us by becoming a patreon"
                >
                  <FontAwesomeIcon icon={faPatreon} />
                </a>
              </div>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">AI Tools</p>
              <li>
                <Link to="/">Text to Speech</Link>
              </li>

              <li>
                <Link to="/video">Video Lipsync</Link>
              </li>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Community</p>

              <li>
                <Link to="/contribute">Upload</Link>
              </li>

              <li>
                <Link to="/leaderboard">Leaderboard</Link>
              </li>

              <li>
                <Link to={FrontendUrlConfig.patronsPage()}>Patrons</Link>
              </li>

              <li>
                <Link to="/firehose">Feed</Link>
              </li>
            </div>
            <div className="py-2 col-12 col-lg-3 d-flex flex-column gap-2 gap-lg-3 align-items-center align-items-lg-start">
              <p className="fw-bold">Info</p>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>

              <li>
                <Link to="/about">About</Link>
              </li>

              <li>
                <Link to="/terms">Terms of Use</Link>
              </li>

              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <a href={FrontendUrlConfig.developerDocs()}>API Docs</a>
              </li>
            </div>
          </div>

          <div className="pt-4">
            <hr />
          </div>

          <div className="d-flex flex-column flex-lg-row pt-2 align-items-center gap-4">
            <span className="flex-grow-1">
              © 2023 FakeYou,{" "}
              <Trans i18nKey="coreUi.footerNav.builtBy">
                Built by <EchelonTwitterLink hideIcon={true} /> in Atlanta.
              </Trans>
            </span>
            <div className="d-flex flex-column flex-lg-row align-items-center ">
              {moderationLink}
              <GitSha />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { FooterNav };
