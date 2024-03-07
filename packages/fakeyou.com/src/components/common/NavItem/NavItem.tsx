import React, { useState } from "react";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import "./NavItem.scss";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";
import { Link } from "react-router-dom";

interface NavItemProps {
  icon?: IconDefinition;
  label: string;
  isHoverable?: boolean;
  link?: string;
  className?: string;
  dropdownItems?: {
    id: number;
    name: string;
    link: string;
    icon?: IconDefinition;
  }[];
}

export default function NavItem({
  label,
  dropdownItems,
  icon,
  isHoverable,
  link,
  className,
}: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const textHover = `${isHovered ? "text-white" : ""}`.trim();

  const renderContent = () => {
    if (isHoverable && dropdownItems) {
      return (
        <>
          {icon && <FontAwesomeIcon icon={icon} className="me-2 fs-7" />}
          <span className={textHover}>
            {label} <FontAwesomeIcon icon={faCaretDown} className="ms-1 fs-7" />
          </span>

          {isHovered && (
            <DropdownMenu items={dropdownItems} onClose={() => {}} />
          )}
        </>
      );
    } else {
      return (
        <>
          {link && (
            <Link to={link} className={textHover}>
              {icon && <FontAwesomeIcon icon={icon} className="me-2 fs-7" />}
              {label}
            </Link>
          )}
        </>
      );
    }
  };

  return (
    <div
      className={`fy-nav-item ${className}`.trim()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderContent()}
    </div>
  );
}
