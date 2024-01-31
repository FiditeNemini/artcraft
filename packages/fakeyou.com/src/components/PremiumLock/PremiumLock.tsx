import { Panel } from "components/common";
import { Link } from "react-router-dom";
import React from "react";
import "./PremiumLock.scss";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/pro-solid-svg-icons";

interface PremiumLockProps {
  requiredPlan?: "plus" | "pro" | "elite";
  children: React.ReactNode;
  session?: any;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function PremiumLock({
  requiredPlan = "plus",
  children,
  sessionSubscriptionsWrapper,
}: PremiumLockProps) {
  const hasAccess = () => {
    switch (requiredPlan) {
      case "plus":
        return (
          sessionSubscriptionsWrapper.hasActivePlusSubscription() ||
          sessionSubscriptionsWrapper.hasActiveProSubscription() ||
          sessionSubscriptionsWrapper.hasActiveEliteSubscription()
        );
      case "pro":
        return (
          sessionSubscriptionsWrapper.hasActiveProSubscription() ||
          sessionSubscriptionsWrapper.hasActiveEliteSubscription()
        );
      case "elite":
        return sessionSubscriptionsWrapper.hasActiveEliteSubscription();
      default:
        return false;
    }
  };

  return (
    <>
      {hasAccess() ? (
        children
      ) : (
        <Panel padding={true} className="fy-premium-lock rounded">
          {children}
          <div className="overlay">
            <div className="d-flex flex-column align-items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="me-2 fs-5" />
              <div>
                Feature requires{" "}
                <Link to="/pricing">{requiredPlan} subscription</Link>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}
