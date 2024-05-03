import { Button, Panel } from "components/common";
import { Link } from "react-router-dom";
import React from "react";
import "./PremiumLock.scss";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUp } from "@fortawesome/pro-solid-svg-icons";

interface PremiumLockProps {
  requiredPlan?: "any" | "plus" | "pro" | "elite";
  large?: boolean;
  children: React.ReactNode;
  session?: any;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  showCtaButton?: boolean;
}

export default function PremiumLock({
  requiredPlan = "plus",
  children,
  sessionSubscriptionsWrapper,
  showCtaButton = false,
  large = false,
}: PremiumLockProps) {
  const hasAccess = () => {
    switch (requiredPlan) {
      case "any":
        return sessionSubscriptionsWrapper.hasPaidFeatures();
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
        return sessionSubscriptionsWrapper.hasPaidFeatures();
    }
  };

  return (
    <>
      {hasAccess() ? (
        children
      ) : (
        <Panel className="fy-premium-lock rounded px-3 py-4">
          {children}
          <div className="overlay">
            <div className="d-flex flex-column align-items-center gap-2 text-center">
              <FontAwesomeIcon
                icon={faLock}
                className={`me-2 ${large ? "fs-4" : "fs-5"}`}
              />
              {requiredPlan === "any" ? (
                <span className={`${large ? "lead fw-medium" : ""}`}>
                  This feature requires a{" "}
                  <Link
                    to="/pricing"
                    className={`${large ? "lead fw-medium" : ""}`}
                  >
                    subscription plan.
                  </Link>
                </span>
              ) : (
                <span>
                  This feature requires a{" "}
                  <Link to="/pricing">{requiredPlan} subscription</Link>
                </span>
              )}

              {showCtaButton && (
                <Button
                  variant="primary"
                  label="Upgrade your account"
                  icon={faUp}
                  to="/pricing"
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}
