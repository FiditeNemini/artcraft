import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Link } from "react-router-dom";
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ContributeIndexPage(props: Props) {
  const categoryActionName = props.sessionWrapper.canEditCategories() ? "Create" : "Suggest";

  return (
    <div>
      <div>
        <h1 className="title is-1"> {t('pages.contributeIndex.heroTitle')} </h1>
        <h1 className="subtitle is-3"> 
          <Trans i18nKey="pages.contributeIndex.heroSubtitle">
            You make FakeYou <strong>better</strong> by contributing 
          </Trans>
        </h1>
      </div>

      <br />

      <div className="content is-medium">
        <p>
          {t('pages.contributeIndex.introText')}
        </p>

        <h3 className="title is-3">{t('pages.contributeIndex.headingUploadModels')}</h3>

        <p>
          <Trans i18nKey="pages.contributeIndex.describeUploadModels">
            Create new voices and video templates for FakeYou. 
            <DiscordLink text={t('pages.contributeIndex.discordLink')} iconAfterText={true} /> 
            to learn how.
          </Trans>
        </p>

        <Link
          to="/upload/tts"
          className="button is-link is-large is-fullwidth "
          >Upload voice (TTS model)</Link>

        <br />

        <Link
          to="/upload/w2l_video"
          className="button is-link is-large is-fullwidth "
          >Upload lipsync video (w2l)</Link>

        <br />

        <Link
          to="/upload/w2l_photo"
          className="button is-link is-large is-fullwidth"
          >Upload lipsync photo (w2l)</Link>

        <h3 className="title is-3"> {categoryActionName} Categories </h3>

        <p>Help us organize the models!</p>

        <Link
          to={FrontendUrlConfig.createCategoryPage()}
          className="button is-info is-large is-fullwidth"
          >{categoryActionName} category</Link>

        <h3 className="title is-3"> More </h3>

        <p> Want to contribute code, design, or data science? <DiscordLink text="Say hi in Discord" iconAfterText={true} />! </p>

      </div>
    </div>
  )
}

export { ContributeIndexPage };
