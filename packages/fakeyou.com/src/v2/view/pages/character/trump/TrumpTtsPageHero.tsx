import React, { useMemo } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Link } from "react-router-dom";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faArrowRight,
  faVolume,
} from "@fortawesome/pro-solid-svg-icons";
import { Analytics } from "../../../../../common/Analytics";
import { WebUrl } from "../../../../../common/WebUrl";
import { PageHeaderWithImage } from "../../../_common/PageHeaderWithImage";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export function TtsPageHero(props: Props) {
  const randomImage = useMemo(() => {
    const images = ["/mascot/trump.webp"];

    return images[Math.floor(Math.random() * images.length)];
  }, []);

  let signUpButton = <></>;
  let viewPricingButton = <></>;

  signUpButton = (
    <>
      <Link to="/">
        <button type="button" className="btn btn-primary w-100">
          See 2000+ more voices
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

  const titleIcon = <FontAwesomeIcon icon={faVolume} className="me-3" />;
  const title = <>Donald Trump TTS</>;
  const subText = (
    <>FakeYou has the very best Donald Trump AI voice on the internet. Use deep fake Donald Trump to say your favorite memes.</>
  );
  const actionButtons = (
    <>
      {signUpButton}
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
