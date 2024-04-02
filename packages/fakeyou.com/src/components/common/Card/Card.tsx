import React, { useEffect, useRef, useState } from "react";
import "./Card.scss";

interface CardProps {
  padding?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  canHover?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundVideoHover?: string;
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
  backgroundVideo,
  backgroundVideoHover,
}: CardProps) {
  const [textHovered, setTextHovered] = useState(false);
  const [videoHovered, setVideoHovered] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoHoverRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (backgroundVideo && backgroundVideoHover) {
      const bgVideo = bgVideoRef.current;
      const bgVideoHover = bgVideoHoverRef.current;

      if (bgVideo && bgVideoHover) {
        const syncVideos = () => {
          if (videoHovered) {
            bgVideoHover.currentTime = bgVideo.currentTime;
          }
        };

        bgVideo.addEventListener("timeupdate", syncVideos);

        return () => {
          bgVideo.removeEventListener("timeupdate", syncVideos);
        };
      }
    }
  }, [videoHovered]);

  return (
    <>
      <div
        className={`card ${padding ? "p-3" : ""} ${
          onClick || canHover ? "card-clickable" : ""
        } ${hoverPrimaryColor ? "card-hover-border-red" : ""} ${
          textHovered ? "bottom-text-hover" : ""
        }`.trim()}
        style={{
          // ...(backgroundImage
          //   ? {
          //       backgroundImage: `url(${backgroundImage})`,
          //       backgroundSize: "cover",
          //       backgroundPosition: "center",
          //     }
          //   : {}),
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
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt="Thumbnail"
            className={`card-bg ${textHovered ? "card-bg-hover-img" : ""}`}
          />
        )}
        <div
          onMouseEnter={() => setVideoHovered(true)}
          onMouseLeave={() => setVideoHovered(false)}
        >
          {backgroundVideo && (
            <video
              ref={bgVideoRef}
              src={backgroundVideo}
              preload="auto"
              autoPlay
              loop
              muted
              className="w-100"
              style={{
                display:
                  !videoHovered && backgroundVideoHover ? "block" : "none",
              }}
            />
          )}
          {backgroundVideoHover && (
            <video
              ref={bgVideoHoverRef}
              src={backgroundVideoHover}
              preload="auto"
              autoPlay
              loop
              muted
              className="w-100"
              style={{ display: videoHovered ? "block" : "none" }}
            />
          )}
        </div>
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
