import React, { useState } from "react";
import { TempInput as Input } from "components/common";
import {
  FontAwesomeIcon,
  FontAwesomeIcon as Icon,
} from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/pro-solid-svg-icons";

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
  search: initialSearch,
  title,
}: Props) {
  const [search, setSearch] = useState(initialSearch);

  const handleInputChange = (e: any) => {
    setSearch(e.target.value);
    onSearchChange(e);
  };

  const clearSearch = () => {
    setSearch("");
    onSearchChange({ target: { value: "" } });
  };

  return (
    <header {...{ className: "fy-media-browser-header" }}>
      <div {...{ className: "fy-media-browser-tools" }}>
        {search !== undefined ? (
          <div className="position-relative w-100">
            <Input
              autoFocus
              {...{
                onChange: handleInputChange,
                value: search,
                placeholder: "Search...",
                icon: faSearch,
              }}
            />
            {search && (
              <FontAwesomeIcon
                icon={faXmark}
                className="position-absolute opacity-75 fs-5"
                style={{
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={clearSearch}
              />
            )}
          </div>
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
