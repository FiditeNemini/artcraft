import React, { useMemo } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faUser,
  faArrowRight,
  faMicrophoneStand,
} from "@fortawesome/pro-solid-svg-icons";

import { useLocalize } from "hooks";
import { PageHeaderWithImage } from "v2/view/_common/PageHeaderWithImage";
import { WebUrl } from "common/WebUrl";
import { Analytics } from "common/Analytics";

interface Props {
  sessionWrapper: SessionWrapper;
}

export function VdPageHero(props: Props) {
  const { t } = useLocalize("VcModelListPage");
  const randomImage = useMemo(() => {
    const images = ["/images/header/voice-designer.png"];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  let signUpButton = <></>;
  let viewPricingButton = <></>;
  let loginButton = <></>;
  const loggedIn = props.sessionWrapper.isLoggedIn();

  if (!loggedIn) {
    signUpButton = (
      <>
        <Link
          to="/signup"
          onClick={() => {
            Analytics.ttsClickHeroSignup();
          }}
        >
          <button type="button" className="btn btn-primary w-100">
            {t("heroButtonSignUp")}
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
            {t("heroButtonPricing")}
          </button>
        </Link>
      </>
    );

    loginButton = (
        <>
        <Link to={WebUrl.loginPage()}>
          <button type="button" className="btn btn-secondary w-100">
            <FontAwesomeIcon icon={faMicrophoneStand} className="me-2" />
            { "Login" }
          </button>
        </Link>
      </>
      );
  }

  const titleIcon = (
    <FontAwesomeIcon icon={faMicrophoneStand} className="me-3 me-lg-4" />
  );
  const title = <>{"Voice Designer"}</>;
  const subText = <>{t("heroText")}</>;
  const actionButtons = (
    <>
      {signUpButton}
      {loginButton}
      {viewPricingButton}
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
