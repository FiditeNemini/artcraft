import React, { useMemo } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Link } from "react-router-dom";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faUser,
  faArrowRight,
  faWaveformLines,
} from "@fortawesome/pro-solid-svg-icons";
import { Analytics } from "../../../../../../common/Analytics";
import { WebUrl } from "../../../../../../common/WebUrl";
import { PageHeaderWithImage } from "../../../../_common/PageHeaderWithImage";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export function VcPageHero(props: Props) {
  const randomImage = useMemo(() => {
    const images = ["mascot/vc.webp"];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let upgradeButton = <></>;
  let myProfileButton = <></>;

  if (!props.sessionWrapper.isLoggedIn()) {
    signUpButton = (
      <>
        <Link
          to="/signup"
          onClick={() => {
            Analytics.ttsClickHeroSignup();
          }}
        >
          <button type="button" className="btn btn-primary w-100">
            {t("tts.TtsModelListPage.heroSection.buttons.signUp")}
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </button>
        </Link>
      </>
    );
    viewPricingButton = (
      <>
        <Link
          to={WebUrl.pricingPageWithReferer("tts_hero_new")}
          onClick={() => {
            Analytics.ttsClickHeroViewPricing();
          }}
        >
          <button type="button" className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faStar} className="me-2" />
            {t("tts.TtsModelListPage.heroSection.buttons.viewPricing")}
          </button>
        </Link>
      </>
    );
  }

  if (props.sessionWrapper.isLoggedIn()) {
    let displayName = props.sessionWrapper.getDisplayName() as string; // NB: If logged in, should be string
    let url = WebUrl.userProfilePage(displayName);
    myProfileButton = (
      <>
        <Link
          to={url}
          onClick={() => {
            Analytics.ttsClickHeroViewProfile();
          }}
        >
          <button type="button" className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            View my profile
          </button>
        </Link>
      </>
    );
    if (!props.sessionSubscriptionsWrapper.hasPaidFeatures()) {
      upgradeButton = (
        <>
          <Link
            to={WebUrl.pricingPageWithReferer("tts_hero_user")}
            onClick={() => {
              Analytics.ttsClickHeroUpgradePlan();
            }}
          >
            <button type="button" className="btn btn-primary w-100">
              <FontAwesomeIcon icon={faStar} className="me-2" />
              Upgrade Plan
            </button>
          </Link>
        </>
      );
    }
  }

  const titleIcon = <FontAwesomeIcon icon={faWaveformLines} className="me-3" />;
  const title = <>Voice Conversion</>;
  const subText = (
    <>Use this tool to change your voice into your favorite characters.</>
  );
  const actionButtons = (
    <>
      {upgradeButton}
      {signUpButton}
      {viewPricingButton}
      {myProfileButton}
    </>
  );

  return (
    <>
      <PageHeaderWithImage
        headerImage={randomImage}
        titleIcon={titleIcon}
        title={title}
        subText={subText}
        showButtons={true}
        actionButtons={actionButtons}
      />
    </>
  );
}
