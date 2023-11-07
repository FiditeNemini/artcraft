import React from "react";
import Panel from "../../common/Panel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Button from "components/common/Button";
import BackButton from "components/common/BackButton";

interface BackConfig {
  label: string;
  to: string;
};

interface PageHeaderProps {
  back?: BackConfig;
  titleIcon?: IconDefinition;
  title: string | React.ReactNode;
  subText: string | React.ReactNode;
  full?: boolean;
  showButton?: boolean;
  extension?: React.ReactNode;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "danger";
  buttonTo?: string;
  buttonIcon?: IconDefinition;
  buttonOnClick?: () => void;
  panel?: boolean;
  imageUrl?: string;
  showBackButton?: boolean;
  backbuttonTo?: string;
  backbuttonLabel?: string;
}

export default function PageHeader({
  back,
  titleIcon,
  title,
  subText,
  full,
  showButton,
  extension,
  buttonLabel,
  buttonVariant = "primary",
  buttonTo,
  buttonIcon,
  buttonOnClick,
  panel = false,
  imageUrl,
  showBackButton,
  backbuttonTo,
  backbuttonLabel,
}: PageHeaderProps) {
  const icon = (
    <>{titleIcon && <FontAwesomeIcon icon={titleIcon} className="me-3" />}</>
  );

  if (!panel) {
    return (
      <div className="py-3 py-lg-4">
        <Panel clear={true}>
          {( back || showBackButton) && (
            <div className="d-flex mb-2 mb-lg-3">
              <BackButton label={back ? back.label : backbuttonLabel} to={ back ? back.to : backbuttonTo } />
            </div>
          )}
          <div className="row">
            <div className="d-flex flex-column col-lg-7 justify-content-center gap-4 py-3">
              <div>
                <h1 className="fw-bold">
                  {/* {icon} */}
                  {title}
                </h1>
                <p className="opacity-75">{subText}</p>
              </div>
              {showButton && (
                <div className="d-md-flex">
                  <Button
                    icon={buttonIcon}
                    variant={buttonVariant}
                    label={buttonLabel}
                    to={buttonTo}
                    onClick={buttonOnClick}
                  />
                </div>
              )}
            </div>
            <div className="d-none d-lg-block col-lg-5">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Header"
                  className="img-fluid my-3"
                  height="235"
                />
              )}
            </div>
          </div>
          {extension && <div>{extension}</div>}
        </Panel>
      </div>
    );
  }

  // Default view without image.
  return (
    <div className="pt-3 pb-4 pt-lg-4">
      <Panel padding>
        <div className="d-flex flex-column gap-4">
          <div>
            <div className="d-flex">
              <h1 className="fw-bold flex-grow-1">
                {icon}
                {title}
              </h1>
              <div className="d-none d-md-block">
                {showButton && (
                  <Button
                    icon={buttonIcon}
                    variant={buttonVariant}
                    label={buttonLabel}
                    to={buttonTo}
                    onClick={buttonOnClick}
                  />
                )}
              </div>
            </div>
            <p>{subText}</p>
          </div>
          {extension && <div>{extension}</div>}
        </div>
      </Panel>
    </div>
  );
}
