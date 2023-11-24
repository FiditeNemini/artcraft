import React from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
}

export default function Card({ padding, children }: CardProps) {
  return <div className={`card ${padding && "p-3"}`}>{children}</div>;
}
