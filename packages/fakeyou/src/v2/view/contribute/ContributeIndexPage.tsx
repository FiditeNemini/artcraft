import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { Link } from "react-router-dom";
import { DiscordLink } from '@storyteller/components/src/elements/DiscordLink';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVideo, faUpload, faImage } from "@fortawesome/free-solid-svg-icons"; 

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
    <div className="container py-5">
      <div className="d-flex flex-column">
        <h1 className="display-5 fw-bold"> {t('pages.contributeIndex.heroTitle')} </h1>
        <h1 className="mb-4"> 
          <Trans i18nKey="pages.contributeIndex.heroSubtitle">
            You make FakeYou <strong>better</strong> by contributing 
          </Trans>
        </h1>
      </div>

      <br />

      <div className="content is-medium">
        <p className="lead" >
          {t('pages.contributeIndex.introText')}
        </p>
        <div className="container-panel pt-4 pb-5">
        <div className="panel p-3 p-lg-4 load-hidden mt-3">
        <h3 className="panel-title">
        <FontAwesomeIcon icon={faUpload} className="me-2" />
        {t('pages.contributeIndex.headingUploadModels')}
        </h3>
        <div className="py-6 d-flex flex-column gap-4">
        
        <p>
          <Trans i18nKey="pages.contributeIndex.describeUploadModels">
            Create new voices and video templates for FakeYou. 
            <DiscordLink text={t('pages.contributeIndex.discordLink1')} iconAfterText={true} /> 
            to learn how.
          </Trans>
        </p>
        <div className="d-flex flex-column flex-md-row gap-3">
        <button className="btn btn-primary w-100">
        <Link
          to="/upload/tts"
          className="button is-link is-large is-fullwidth text-white"
          >
            
            <FontAwesomeIcon icon={faVolumeHigh} className="me-2" />
            {t('pages.contributeIndex.buttonUploadVoice')}
            
            </Link>
            
        <br />
        </button>
        <button className="btn btn-primary w-100">
        <Link
          to="/upload/w2l_video"
          className="button is-link is-large is-fullwidth text-white" 
          >
             <FontAwesomeIcon icon={faVideo} className="me-2" />
            {t('pages.contributeIndex.buttonUploadW2lVideo')}</Link>

        <br />
       </button>
       <button className="btn btn-primary w-100">
        <Link
          to="/upload/w2l_photo"
          className="button is-link is-large is-fullwidth text-white"
          >
            <FontAwesomeIcon icon={faImage} className="me-2" />
            {t('pages.contributeIndex.buttonUploadW2lPhoto')}
            </Link>
          </button>

          </div>
          </div>
          </div>
          </div>

      <div className="container-panel pt-2 pb-4">
       <div className="panel p-3 p-lg-4 load-hidden mt-lg-0"> 
        <h2 className="panel-title">{categoryHeading}</h2>
        <div className="py-6 d-flex flex-column gap-4">
        <p>{t('pages.contributeIndex.describeSuggest')}</p>
        <div className="d-flex gap-3">
        <button className="btn btn-secondary w-100"> 
        <Link
          to={FrontendUrlConfig.createCategoryPage()}
          className="button is-info is-large is-fullwidth text-black"
          >{categoryButton}</Link>
          
          </button>
        </div> 
        </div>
        
        </div>
        <h3 className="title is-3">{t('pages.contributeIndex.headingMore')}</h3>
      </div>
      <div className="container pb-5">
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
   </div>
  )
}

export { ContributeIndexPage };
