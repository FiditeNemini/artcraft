import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
// import Alert from "components/common/Alert/Alert";
import { useLocalize } from "hooks";
import React from "react";
import LandingDemo from "./LandingDemo/FakeYouLandingDemo";
import { Button, Panel } from "components/common";

interface FakeYouLandingHeaderProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function FakeYouLandingHeader({
  sessionSubscriptionsWrapper,
}: FakeYouLandingHeaderProps) {
  const { t } = useLocalize("LandingPage");

  return (
    <div className="d-flex flex-column fy-header">
      {/* <Panel clear={true}>
        <Alert
          id="text-to-image-alert"
          icon={faSparkles}
          message={t("alertTtiText")}
          alertVariant="new"
          link="/text-to-image"
          linkText={t("alertTtiCta")}
          className="my-3"
        />
      </Panel> */}

      <div className="my-lg-5 py-lg-5 pt-3 pb-5">
        <div className="row g-5">
          <div className="col-12 col-lg-6 order-lg-2">
            <LandingDemo
              sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
            />
          </div>
          <div className="col-12 col-lg-6 order-lg-1 d-flex flex-column align-items-center pt-3 pt-lg-0">
            <Panel clear={true}>
              <h1 className="fw-bold display-5 text-center text-lg-start px-md-5 px-lg-0 pe-lg-5">
                {t("heroTitle")}
              </h1>
              <p className="lead opacity-75 pb-4 text-center text-lg-start px-md-5 px-lg-0 pe-lg-5">
                {t("heroText")}
              </p>
              <div className="d-flex justify-content-center justify-content-lg-start">
                <Button
                  label="Get Started Free"
                  to="/signup"
                  icon={faArrowRight}
                  iconFlip={true}
                />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
