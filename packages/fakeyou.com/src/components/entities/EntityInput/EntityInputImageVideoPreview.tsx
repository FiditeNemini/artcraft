import React, { useState } from "react";
import Cropper, { Point } from "react-easy-crop";
import { Button } from "components/common";
import { useVideo } from "hooks";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { CropProps } from "./EntityInput";

interface EntityInputImageVideoPreviewProps {
  crop: Point;
  cropProps?: CropProps;
  cropSet: (crop: Point) => void;
  image?: string;
  video?: string;
  zoom: number;
  zoomSet: (zoom: number) => void;
}

export default function EntityInputImageVideoPreview({
  crop,
  cropProps,
  cropSet,
  image,
  video,
  zoom,
  zoomSet,
}: EntityInputImageVideoPreviewProps) {
  const [videoRef, videoRefSet] = useState<
    React.RefObject<HTMLVideoElement> | undefined
  >();
  const [isPlaying, isPlayingSet] = useState(false);
  const [{ playCtrl }, { onEnded }] = useVideo({
    videoRef,
    onEnded: (playPause: boolean) => isPlayingSet(!playPause),
  });

  return (
    <div {...{ className: "fy-entity-input-media-preview" }}>
      <Cropper
        {...{
          aspect: cropProps?.aspect || 1,
          ...(image ? { image } : {}),
          classes: {
            containerClassName: `fy-entity-input-crop-container${
              cropProps ? "" : "-hidden"
            }`,
            cropAreaClassName: "fy-entity-input-crop-area",
            mediaClassName: "fy-entity-input-crop-media",
          },
          crop,
          mediaProps: {
            autoPlay: false,
            loop: false,
            onEnded,
          },
          onCropChange: (cropLocation: Point) => {
            if (cropProps) {
              cropSet(cropLocation);
            }
          },
          ...(cropProps?.onCropComplete
            ? { onCropComplete: cropProps.onCropComplete }
            : {}),
          onZoomChange: (zoomValue: number) => {
            if (cropProps) {
              zoomSet(zoomValue);
            }
          },
          setVideoRef: (ref: React.RefObject<HTMLVideoElement>) => {
            videoRefSet(ref);
          },
          showGrid: !!cropProps,
          style: {
            cropAreaStyle: {
              border: "none",
              // color: "rgba(#f00,0.0)",
            },
          },
          ...(video ? { video } : {}),
          zoom,
        }}
      />
      {video ? (
        <Button
          {...{
            className: "fy-entity-input-play-button",
            icon: isPlaying ? faPause : faPlay,
            onClick: () => {
              playCtrl!();
              isPlayingSet(!isPlaying);
            },
          }}
        />
      ) : null}
      {cropProps ? (
        <div {...{ className: "fy-entity-input-crop-tip" }}>
          Drag and scroll to crop
        </div>
      ) : null}
    </div>
  );
}
