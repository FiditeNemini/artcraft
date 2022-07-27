import React from "react";
import { GitSha } from "@storyteller/components/src/elements/GitSha";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";

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
import { USE_REFRESH } from "../../Refresh";

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

  if (!USE_REFRESH) {
    return (
      <div>
        <hr />
        <div className="content has-text-centered">
          <p>
            <Link to="/">{t("coreUi.footerNav.textToSpeech")}</Link>
            &nbsp;|
            <Link to="/video">{t("coreUi.footerNav.video")}</Link>
            &nbsp;|
            <Link to="/contribute">{t("coreUi.footerNav.upload")}</Link>
            &nbsp;|
            <Link to="/leaderboard">{t("coreUi.footerNav.leaderboard")}</Link>
            &nbsp;|
            <Link to={FrontendUrlConfig.patronsPage()}>
              {t("coreUi.footerNav.patrons")}
            </Link>
            &nbsp;|
            <Link to="/firehose">{t("coreUi.footerNav.feed")}</Link>
            &nbsp;|
            <a href={FrontendUrlConfig.developerDocs()}>
              {t("coreUi.footerNav.apiDocs")}
            </a>
            &nbsp;|
            <Link to="/about">{t("coreUi.footerNav.aboutUs")}</Link>
            &nbsp;|
            <Link to="/terms">{t("coreUi.footerNav.termsOfUse")}</Link>
          </p>

          <div className="v2_social">
            <a
              href="https://discord.gg/H72KFXm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/social-icons/016-discord.png"
                alt="Join us on Discord!"
              />
            </a>
            <a
              href="https://twitch.tv/FakeYouLabs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/social-icons/094-twitch.png" alt="Twitch" />
            </a>
            <a
              href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/social-icons/096-twitter.png" alt="Twitter" />
            </a>
            <a
              href="https://facebook.com/vocodes"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/social-icons/024-facebook.png" alt="Facething" />
            </a>
            <a
              href="https://www.patreon.com/FakeYou"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/social-icons/061-patreon.png" alt="Patreon" />
            </a>
          </div>

          <p>
            <Trans i18nKey="coreUi.footerNav.builtBy">
              Built by <Link to="/profile/echelon">@echelon</Link> in Atlanta.
            </Trans>
          </p>

          <p>
            <GitSha />
          </p>

          {moderationLink}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container">
        <hr />
      </div>

      <div className="d-flex flex-column container py-5 gap-4">
        <div className="text-center align-items-center justify-content-center gap-2 d-flex flex-wrap">
          <div>
            <Link to="/">Text to Speech</Link>
          </div>
          {/*
          &nbsp;|
          <Link to="/pricing">{t('coreUi.footerNav.pricing')}</Link>
          */}
          &nbsp;|
          <Link to="/video">{t('coreUi.footerNav.video')}</Link>
          &nbsp;|
          <div>
            <Link to="/contribute">Upload</Link>
          </div>
          &nbsp;|
          <div>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
          &nbsp;|
          <div>
            <Link to={FrontendUrlConfig.patronsPage()}>Patrons</Link>
          </div>
          &nbsp;|
          <div>
            <Link to="/firehose">Feed</Link>
          </div>
          &nbsp;|
          <div>
            <a href={FrontendUrlConfig.developerDocs()}>API Docs</a>
          </div>
          &nbsp;|
          <div>
            <Link to="/about">About Us</Link>
          </div>
          &nbsp;|
          <div>
            <Link to="/terms">Terms of Use</Link>
          </div>
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
