import React from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  canHover?: boolean;
}

export default function Card({
  padding,
  children,
  onClick,
  canHover,
}: CardProps) {
  return (
    <div
      className={`card ${padding ? "p-3" : ""} ${
        onClick || canHover ? "card-clickable" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
