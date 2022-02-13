import React from 'react';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { Link } from "react-router-dom";
import { DiscordLink } from '../_common/DiscordLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { t } from 'i18next';
import { Trans } from 'react-i18next';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ContributeIndexPage(props: Props) {
  const categoryHeading = props.sessionWrapper.canEditCategories() ?
      t('pages.contributeIndex.headingCreateCategory') :
      t('pages.contributeIndex.headingSuggestCategory');

  const categoryButton = props.sessionWrapper.canEditCategories() ?
      t('pages.contributeIndex.buttonCreateCategory') :
      t('pages.contributeIndex.buttonSuggestCategory');

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
            <DiscordLink text={t('pages.contributeIndex.discordLink1')} iconAfterText={true} /> 
            to learn how.
          </Trans>
        </p>

        <Link
          to="/upload/tts"
          className="button is-link is-large is-fullwidth "
          >{t('pages.contributeIndex.buttonUploadVoice')}</Link>

        <br />

        <Link
          to="/upload/w2l_video"
          className="button is-link is-large is-fullwidth "
          >{t('pages.contributeIndex.buttonUploadW2lVideo')}</Link>

        <br />

        <Link
          to="/upload/w2l_photo"
          className="button is-link is-large is-fullwidth"
          >{t('pages.contributeIndex.buttonUploadW2lPhoto')}</Link>

        <h3 className="title is-3">{categoryHeading}</h3>

        <p>{t('pages.contributeIndex.describeSuggest')}</p>

        <Link
          to={FrontendUrlConfig.createCategoryPage()}
          className="button is-info is-large is-fullwidth"
          >{categoryButton}</Link>

        <h3 className="title is-3">{t('pages.contributeIndex.headingMore')}</h3>

        <p>
          <Trans i18nKey='pages.contributeIndex.describeMore'>
            Want to contribute code, design, or data science? 
            <DiscordLink 
              text={t('pages.contributeIndex.discordLink2')} 
              iconAfterText={true} />! 
          </Trans>
        </p>

      </div>
    </div>
  )
}

export { ContributeIndexPage };
