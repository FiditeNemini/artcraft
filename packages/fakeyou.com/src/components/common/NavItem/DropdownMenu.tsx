import React from "react";
import { a, useSpring } from "@react-spring/web";
import { Link } from "react-router-dom";
import "./NavItem.scss";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DropdownItem {
  id: number;
  name: string;
  link: string;
  icon?: IconDefinition;
}

interface DropdownMenuProps {
  items: DropdownItem[];
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 100 }, // Adjust timing as needed
  });

  return (
    <a.div style={fadeIn} className="fy-dropdown-menu">
      {items.map(item => (
        <Link key={item.id} to={item.link} className="fy-dropdown-item">
          <span>
            {item.icon && (
              <FontAwesomeIcon icon={item.icon} className="me-2 fs-7" />
            )}
            {item.name}
          </span>
        </Link>
      ))}
    </a.div>
  );
}
