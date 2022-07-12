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
      <div className="container py-5">
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
      </div>
      <div className="container-panel pt-4 pb-5">
        <div className="panel p-3 p-lg-4 load-hidden mt-3">
          <h1 className="panel-title fw-bold">
            <i className="fa-solid fa-upload me-3"></i>
            {t("pages.contributeIndex.headingUploadModels")}
          </h1>
          <div className="py-6 d-flex flex-column gap-4">
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
            <div className="d-flex flex-column flex-md-row gap-3">
              <Link to="/upload/tts" className="btn btn-primary w-100">
                {t("pages.contributeIndex.buttonUploadVoice")}
              </Link>

              <button className="btn btn-primary w-100">
                <i className="fa-solid fa-video me-2"></i>Lipsync Video (w2l)
              </button>
              <button className="btn btn-primary w-100">
                <i className="fa-solid fa-image me-2"></i>Lipsync Photo (w2l)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container-panel pt-2 pb-4">
        <div className="panel p-3 p-lg-4 load-hidden mt-lg-0">
          <h2 className="panel-title">Suggest Categories</h2>
          <div className="py-6 d-flex flex-column gap-4">
            <p>Help us organize the models!</p>
            <div className="d-flex gap-3">
              <button className="btn btn-secondary w-100">
                Suggest category
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container pb-5">
        <p>
          Want to contribute code, design, or data science?
          <a className="text-link">Say hi in Discord</a>.
        </p>
      </div>
    </div>
  );
}

export { ContributeIndexPage };
