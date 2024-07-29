import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import "./Alert.scss";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { Link } from "react-router-dom";

interface AlertProps {
  id: string;
  message: string;
  alertVariant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "new";
  duration?: number;
  icon?: IconProp;
  link?: string;
  linkText?: string;
  className?: string;
}

function Alert({
  id,
  message,
  alertVariant,
  duration,
  icon,
  linkText,
  link,
  className,
}: AlertProps) {
  const [show, setShow] = useState<boolean>(() => {
    const closedAt = localStorage.getItem(`alertClosedAt_${id}`);
    const currentTime = Date.now();
    const hideDurationPassed =
      !closedAt || currentTime - parseInt(closedAt) >= duration! * 1000; // Using ! after duration since it can be undefined, but defaultProps will handle it

    if (hideDurationPassed) {
      localStorage.removeItem(`alertClosedAt_${id}`);
    }

    return hideDurationPassed;
  });

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(`alertClosedAt_${id}`, Date.now().toString());
  };

  return (
    <>
      {show && (
        <div
          className={`alert alert-${alertVariant} alert-dismissible fade show ${
            className && className
          }`.trim()}
          role="alert"
        >
          {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
          <span className="fw-medium">{message}</span>{" "}
          {link && linkText && (
            <Link to={link} className="fw-semibold">
              <div className="d-inline-flex align-items-center">
                {linkText}
                <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
              </div>
            </Link>
          )}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        </div>
      )}
    </>
  );
}

Alert.defaultProps = {
  alertVariant: "primary",
  duration: 259200, // default to 3 days in seconds
};

export default Alert;
