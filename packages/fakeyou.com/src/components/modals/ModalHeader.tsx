import React from "react";
import { TempInput as Input } from "components/common";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  children?: any;
  handleClose?: any;
  onSearchChange?: (e: any) => void;
  search?: string;
  title?: string;
}

export default function ModalHeader({
  children,
  handleClose,
  onSearchChange = () => {},
  search,
  title,
}: Props) {
  return (
    <header {...{ className: "fy-media-browser-header" }}>
      <div {...{ className: "fy-media-browser-tools" }}>
        {search !== undefined ? (
          <Input autoFocus {...{ onChange: onSearchChange, value: search }} />
        ) : (
          title && <h3 className="fw-semibold">{title}</h3>
        )}

        {children && (
          <div {...{ className: "fy-media-browser-tools" }}>{children}</div>
        )}
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
    </header>
  );
}
