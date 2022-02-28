import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Link } from 'react-router-dom';

import './_css/footer.scss'
import { ModerationIcon } from './_icons/ModerationIcon';
import { FrontendUrlConfig } from '../../common/FrontendUrlConfig';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

interface Props {
  sessionWrapper: SessionWrapper,
}

function NewFooterNavFc(props: Props) {

  let moderationLink = <span />;

  if (props.sessionWrapper.canBanUsers()) {
    moderationLink = (
      <div className="v2_mod_link">
        <Link to={FrontendUrlConfig.moderationMain()}><ModerationIcon /> Mod Controls</Link>
      </div>
    );
  }

  return (
    <div>
      <hr />

      <div className="content has-text-centered">
        <p>
          <Link to="/">{t('coreUi.footerNav.textToSpeech')}</Link>
          &nbsp;|
          <Link to="/video">{t('coreUi.footerNav.video')}</Link>
          &nbsp;|
          <Link to="/contribute">{t('coreUi.footerNav.upload')}</Link>
          &nbsp;|
          <Link to="/leaderboard">{t('coreUi.footerNav.leaderboard')}</Link>
          &nbsp;|
          <Link to={FrontendUrlConfig.patronsPage()}>{t('coreUi.footerNav.patrons')}</Link>
          &nbsp;|
          <Link to="/firehose">{t('coreUi.footerNav.feed')}</Link>
          &nbsp;|
          <a href={FrontendUrlConfig.developerDocs()}>{t('coreUi.footerNav.apiDocs')}</a>
          &nbsp;|
          <Link to="/about">{t('coreUi.footerNav.aboutUs')}</Link>
          &nbsp;|
          <Link to="/terms">{t('coreUi.footerNav.termsOfUse')}</Link>
        </p>


        <div className="v2_social">
          <a href="https://discord.gg/H72KFXm" target="_blank" rel="noopener noreferrer"><img src="/social-icons/016-discord.png" alt="Join us on Discord!" /></a>
          <a href="https://twitch.tv/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/094-twitch.png" alt="Twitch" /></a>
          <a href="https://twitter.com/intent/follow?screen_name=FakeYouApp" target="_blank" rel="noopener noreferrer"><img src="/social-icons/096-twitter.png" alt="Twitter" /></a>
          <a href="https://facebook.com/vocodes" target="_blank" rel="noopener noreferrer"><img src="/social-icons/024-facebook.png" alt="Facething" /></a>
          <a href="https://www.patreon.com/FakeYou" target="_blank" rel="noopener noreferrer"><img src="/social-icons/061-patreon.png" alt="Patreon" /></a>
        </div>

        <p>
          <Trans i18nKey="coreUi.footerNav.builtBy">
            Built by <Link to="/profile/echelon">@echelon</Link> in Atlanta.
          </Trans>
        </p>

      </div>

      {moderationLink}

    </div>
  )
}

export { NewFooterNavFc };
