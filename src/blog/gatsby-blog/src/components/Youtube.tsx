import React from "react";

const respIframeWrapper = {
  position: "relative" as "relative",
  height: 0,
  overflow: "hidden",
  paddingBottom: "50%",
};

export const Youtube = ({
  videoId,
  title,
}: {
  videoId: string;
  title?: string;
}) => {
  return (
    <div style={respIframeWrapper} className="youtube-video">
      <iframe
        className="absolute left-0 top-0 h-full w-full border-0"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title ?? "YouTube video player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
};
