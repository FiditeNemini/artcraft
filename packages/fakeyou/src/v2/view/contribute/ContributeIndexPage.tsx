import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { DiscordLink } from "@storyteller/components/src/elements/DiscordLink";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVideo,
  faUpload,
  faImage,
  faTags,
  faHandsHelping,
} from "@fortawesome/free-solid-svg-icons";
import { distance, delay, delay2, duration } from "../../../data/animation";
import { USE_REFRESH } from "../../../Refresh";
const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
}

function ContributeIndexPage(props: Props) {
  const categoryHeading = props.sessionWrapper.canEditCategories()
    ? t("pages.contributeIndex.headingCreateCategory")
    : t("pages.contributeIndex.headingSuggestCategory");

  const categoryButton = props.sessionWrapper.canEditCategories()
    ? t("pages.contributeIndex.buttonCreateCategory")
    : t("pages.contributeIndex.buttonSuggestCategory");

  if (!USE_REFRESH) {
    return (
      <div>
        <div>
          <h1 className="title is-1">
            {" "}
            {t("pages.contributeIndex.heroTitle")}{" "}
          </h1>
          <h1 className="subtitle is-3">
            <Trans i18nKey="pages.contributeIndex.heroSubtitle">
              You make FakeYou <strong>better</strong> by contributing
            </Trans>
          </h1>
        </div>

        <br />

        <div className="content is-medium">
          <p>{t("pages.contributeIndex.introText")}</p>

          <h3 className="title is-3">
            {t("pages.contributeIndex.headingUploadModels")}
          </h3>

          <p>
            <Trans i18nKey="pages.contributeIndex.describeUploadModels">
              Create new voices and video templates for FakeYou.
              <DiscordLink
                text={t("pages.contributeIndex.discordLink1")}
                iconAfterText={true}
              />
              to learn how.
            </Trans>
          </p>

          <Link
            to="/upload/tts"
            className="button is-link is-large is-fullwidth "
          >
            {t("pages.contributeIndex.buttonUploadVoice")}
          </Link>

          <br />

          <Link
            to="/upload/w2l_video"
            className="button is-link is-large is-fullwidth "
          >
            {t("pages.contributeIndex.buttonUploadW2lVideo")}
          </Link>

          <br />

          <Link
            to="/upload/w2l_photo"
            className="button is-link is-large is-fullwidth"
          >
            {t("pages.contributeIndex.buttonUploadW2lPhoto")}
          </Link>

          <h3 className="title is-3">{categoryHeading}</h3>

          <p>{t("pages.contributeIndex.describeSuggest")}</p>

          <Link
            to={FrontendUrlConfig.createCategoryPage()}
            className="button is-info is-large is-fullwidth"
          >
            {categoryButton}
          </Link>

          <h3 className="title is-3">
            {t("pages.contributeIndex.headingMore")}
          </h3>

          <p>
            <Trans i18nKey="pages.contributeIndex.describeMore">
              Want to contribute code, design, or data science?
              <DiscordLink
                text={t("pages.contributeIndex.discordLink2")}
                iconAfterText={true}
              />
              !
            </Trans>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container py-5 pb-4 pb-lg-5 px-md-4 px-lg-5 px-xl-3">
        <Fade bottom cascade duration={duration} distance={distance}>
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold">
              {t("pages.contributeIndex.heroTitle")}
            </h1>
            <h3 className="mb-4">
              <Trans i18nKey="pages.contributeIndex.heroSubtitle">
                You make FakeYou <strong>better</strong> by contributing
              </Trans>
            </h3>
            <p className="lead">{t("pages.contributeIndex.introText")}</p>
          </div>
        </Fade>
      </div>

      <Fade
        bottom
        cascade
        distance={distance}
        delay={delay2}
        duration={duration}
      >
        <div className="container-panel pt-5 pb-5">
          <div className="panel p-3 p-lg-4 load-hidden mt-3">
            <h1 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faUpload} className="me-3" />
              {t("pages.contributeIndex.headingUploadModels")}
            </h1>
            <div className="py-6 d-flex flex-column gap-4">
              <p className="text-center text-lg-start">
                <Trans i18nKey="pages.contributeIndex.describeUploadModels">
                  Create new voices and video templates for FakeYou.
                  <DiscordLink
                    text={t("pages.contributeIndex.discordLink1")}
                    iconAfterText={true}
                  />
                  to learn how.
                </Trans>
              </p>
              <div className="d-flex flex-column flex-lg-row gap-3">
                <Link to="/upload/tts" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadVoice")}
                </Link>
                <Link to="/upload/w2l_video" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVideo} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadW2lVideo")}
                </Link>
                <Link to="/upload/w2l_photo" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faImage} className="me-3" />
                  {t("pages.contributeIndex.buttonUploadW2lPhoto")}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="container-panel pt-4 pb-4">
          <div className="panel p-3 p-lg-4 load-hidden mt-lg-0">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faTags} className="me-3" />
              {categoryHeading}
            </h2>
            <div className="py-6 d-flex flex-column gap-4">
              <p className="text-center text-lg-start">
                {t("pages.contributeIndex.describeSuggest")}
              </p>
              <div className="d-flex gap-3">
                <button className="btn btn-secondary w-100">
                  Suggest category
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container-panel py-5">
          <div className="panel p-3 p-lg-4 load-hidden mt-lg-0">
            <h2 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faHandsHelping} className="me-3" />
              {t("pages.contributeIndex.headingMore")}
            </h2>
            <div className="py-6 d-flex flex-column gap-4">
              <p className="text-center text-lg-start">
                <Trans i18nKey="pages.contributeIndex.describeMore">
                  Want to contribute code, design, or data science?
                  <DiscordLink
                    text={t("pages.contributeIndex.discordLink2")}
                    iconAfterText={true}
                  />
                  !
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export { ContributeIndexPage };
