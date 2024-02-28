import React from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  canHover?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function Card({
  padding,
  children,
  onClick,
  canHover,
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  return (
    <div
      className={`card ${padding ? "p-3" : ""} ${
        onClick || canHover ? "card-clickable" : ""
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
