import React from "react";
import Panel from "../../common/Panel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Button from "components/common/Button";

interface PageHeaderProps {
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
  withImage?: boolean;
  imageUrl?: string;
}

export default function PageHeader({
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
  withImage,
  imageUrl,
}: PageHeaderProps) {
  const icon = (
    <>{titleIcon && <FontAwesomeIcon icon={titleIcon} className="me-3" />}</>
  );

  if (withImage) {
    return (
      <div className="pt-3 pb-4 pt-lg-4">
        <Panel clear={true}>
          <div className="row">
            <div className="d-flex flex-column col-lg-7 justify-content-center gap-4">
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
                <img src={imageUrl} alt="Header" className="img-fluid my-3" />
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
