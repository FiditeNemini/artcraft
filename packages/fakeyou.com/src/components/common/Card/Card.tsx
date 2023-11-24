import React from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function Card({ padding, children, onClick }: CardProps) {
  return (
    <div
      className={`card ${padding ? "p-3" : ""} ${
        onClick ? "card-clickable" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
