import React from "react";
import Cropper from "react-easy-crop";

interface FaceCropperProps {
  videoSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  zoomWithScroll?: boolean;
  showGrid?: boolean;
  isCropping?: boolean;
  mediaProps?: any;
  onCropComplete?: (croppedArea: any, croppedAreaPixels: any) => void;
}

const FaceCropper: React.FC<FaceCropperProps> = ({
  videoSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  zoomWithScroll = false,
  showGrid = false,
  isCropping,
  onCropComplete,
  ...props
}) => {
  return (
    <Cropper
      video={videoSrc}
      crop={crop}
      zoom={zoom}
      zoomWithScroll={zoomWithScroll}
      aspect={1}
      onCropChange={onCropChange}
      onZoomChange={onZoomChange}
      showGrid={showGrid}
      objectFit="cover"
      classes={{
        cropAreaClassName: `border-0 ${
          isCropping ? "" : "cursor-default"
        }`.trim(),
      }}
      zoomSpeed={0.25}
      onCropComplete={onCropComplete}
      {...props}
    />
  );
};

export default FaceCropper;
