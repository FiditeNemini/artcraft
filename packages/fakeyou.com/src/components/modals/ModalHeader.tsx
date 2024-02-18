import React from "react";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  children?: any;
  handleClose?: any;
  title?: string;
}

export default function ModalHeader({ children, handleClose, title }: Props) {
  return (
    <header {...{ className: "fy-media-browser-header" }}>
      <div {...{ className: "fy-media-browser-tools" }}>
        {title && <h3 className="fw-semibold">{title}</h3>}
        {handleClose && (
          <Icon
            {...{
              className: "icon-close-button",
              icon: faXmark,
              onClick: () => handleClose(),
            }}
          />
        )}
      </div>
      {children && (
        <div {...{ className: "fy-media-browser-tools" }}>{children}</div>
      )}
    </header>
  );
}
