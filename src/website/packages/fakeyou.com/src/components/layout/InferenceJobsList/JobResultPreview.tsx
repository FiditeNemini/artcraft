import React from "react";
import { MediaURLs } from "hooks";
// import { MediaFileClass } from "../enums/MediaFileClass";
import { MediaFileClass } from "@storyteller/components/src/api";

import { a, TransitionFn, useTransition } from "@react-spring/web";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";

interface JobResultPreviewProps {
  hover: boolean;
  mediaFile: MediaFile;
  show?: boolean;
  urls: MediaURLs;
}

export default function JobResultPreview({
  hover,
  mediaFile,
  show,
  urls,
}: JobResultPreviewProps) {
  const transitions: TransitionFn<boolean, { opacity: number }> = useTransition(
    hover,
    {
      config: { mass: 1, tension: 80, friction: 10 },
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
    }
  );

  const previewSwitch = () => {
    switch (mediaFile?.media_class) {
      case MediaFileClass.Image:
        return <div>Image</div>;
      case MediaFileClass.Video:
        return (
          <div {...{ className: "fy-inference-job-preview-thumb" }}>
            <a.img
              {...{
                className: "fy-inference-job-preview-static",
                src: urls.thumb(),
              }}
            />
            {transitions((style, isHovering) =>
              isHovering ? (
                <a.img
                  {...{
                    className: "fy-inference-job-preview-gif",
                    src: urls.gif(),
                    style,
                  }}
                />
              ) : null
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return show ? (
    <div {...{ className: "fy-inference-job-preview" }}>{previewSwitch()}</div>
  ) : null;
}
