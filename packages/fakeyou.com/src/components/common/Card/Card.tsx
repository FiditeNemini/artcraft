import React, { useState } from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  canHover?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  backgroundImage?: string;
  height?: string;
  borderWidth?: string;
  hoverPrimaryColor?: true;
  aspectRatio?: string;
  bottomText?: string;
}

export default function Card({
  padding,
  children,
  onClick,
  canHover,
  onMouseEnter,
  onMouseLeave,
  backgroundImage,
  height,
  borderWidth,
  hoverPrimaryColor,
  aspectRatio = "auto",
  bottomText,
}: CardProps) {
  const [textHovered, setTextHovered] = useState(false);

  return (
    <>
      <div
        className={`card ${padding ? "p-3" : ""} ${
          onClick || canHover ? "card-clickable" : ""
        } ${hoverPrimaryColor ? "card-hover-border-red" : ""} ${
          textHovered ? "bottom-text-hover" : ""
        }`.trim()}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: height || "auto",
          borderWidth: borderWidth || "1px",
          borderStyle: "solid",
          aspectRatio: aspectRatio || "auto",
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
      {bottomText && (
        <h6
          className="card-bottom-text"
          onClick={onClick}
          onMouseEnter={() => setTextHovered(true)}
          onMouseLeave={() => setTextHovered(false)}
        >
          {bottomText}
        </h6>
      )}
    </>
  );
}
