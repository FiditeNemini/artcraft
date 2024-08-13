import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button } from "components/common";
import FaceCropper from "./FaceCropper";
import ThumbnailItem from "./ThumbnailItem";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import LoadingSpinner from "components/common/LoadingSpinner";
import {
  GetMedia,
  MediaFile,
} from "@storyteller/components/src/api/media_files/GetMedia";
import { faUpload } from "@fortawesome/pro-solid-svg-icons";
import { isMobile } from "react-device-detect";

interface ThumbnailMediaPickerProps {
  mediaTokens: string[];
  selectedIndex: number;
  handleThumbnailClick: (index: number) => void;
  title?: string;
  description?: string;
  badgeLabel?: string;
  cropper?: true;
  showCropButton?: boolean;
  cropArea?: { x: number; y: number; height: number; width: number };
  setCropArea?: (cropArea: {
    x: number;
    y: number;
    height: number;
    width: number;
  }) => void;
}

interface MediaData {
  [key: string]: MediaFile | undefined;
}

const ThumbnailMediaPicker: React.FC<ThumbnailMediaPickerProps> = React.memo(
  ({
    selectedIndex,
    handleThumbnailClick,
    badgeLabel = "Media",
    title = "Select Source",
    description = "This image or video is what the final video will look like.",
    cropper = false,
    cropArea,
    setCropArea,
    mediaTokens,
    showCropButton = true,
  }) => {
    const [zoom, setZoom] = useState(1);
    const [isCropping, setIsCropping] = useState(false);
    const [mediaData, setMediaData] = useState<{ [key: string]: any }>({});

    useEffect(() => {
      const fetchMediaData = async () => {
        const mediaDataPromises = mediaTokens.map(async token => {
          const response = await GetMedia(token, {});
          return { token, media: response.media_file };
        });

        const mediaDataArray = await Promise.all(mediaDataPromises);
        const mediaDataObject = mediaDataArray.reduce(
          (acc, { token, media }) => {
            acc[token] = media;
            return acc;
          },
          {} as MediaData
        );

        setMediaData(mediaDataObject);
      };

      fetchMediaData();
    }, [mediaTokens]);

    const selectedMedia = mediaData[mediaTokens[selectedIndex]];
    const mediaLink = selectedMedia?.public_bucket_path
      ? new BucketConfig().getGcsUrl(selectedMedia.public_bucket_path)
      : null;

    useEffect(() => {
      if (setCropArea) {
        setCropArea({ x: 0, y: 0, height: 0, width: 0 });
        setZoom(1);
      }
    }, [selectedIndex, setCropArea]);

    const onCropChange = useCallback(
      crop => {
        if (setCropArea) {
          if (isCropping) {
            setCropArea(crop);
          }
        }
      },
      [isCropping, setCropArea]
    );

    const onZoomChange = useCallback(
      zoom => {
        if (isCropping) {
          setZoom(zoom);
        }
      },
      [isCropping]
    );

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
      console.log(croppedArea, croppedAreaPixels, "HELLO");
    }, []);

    return (
      <div className="d-flex gap-3 flex-column">
        <div className="lp-media order-4 order-lg-1">
          <div className="lp-tag">
            <div>
              {!isCropping ? (
                <Badge label={badgeLabel} color="ultramarine" overlay={true} />
              ) : (
                <Badge
                  label={`${isMobile ? "Pinch" : "Scroll"} and drag to crop`}
                  color="gray"
                  overlay={true}
                />
              )}
            </div>
            {cropper && showCropButton && (
              <div>
                <Button
                  label={isCropping ? "Done" : "Crop Face"}
                  className="py-1 px-2 fs-7"
                  variant={isCropping ? "primary" : "action"}
                  onClick={() => setIsCropping(prev => !prev)}
                />
              </div>
            )}
          </div>

          {cropper && cropArea ? (
            <>
              {mediaLink ? (
                <FaceCropper
                  videoSrc={mediaLink}
                  crop={cropArea}
                  zoom={zoom}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onCropComplete={onCropComplete}
                  showGrid={isCropping ? true : false}
                  zoomWithScroll={isCropping ? true : false}
                  isCropping={isCropping}
                  mediaProps={{
                    autoPlay: true,
                    loop: true,
                  }}
                />
              ) : (
                <LoadingSpinner padding={false} />
              )}
            </>
          ) : (
            <div className="w-100 h-100 object-fit-contain d-flex align-items-center justify-content-center">
              {mediaLink ? (
                selectedMedia?.media_type === "image" ? (
                  <img
                    key={selectedIndex}
                    src={mediaLink}
                    alt="Selected media"
                  />
                ) : (
                  <video
                    key={selectedIndex}
                    autoPlay={true}
                    muted
                    loop={true}
                    playsInline
                    controls={false}
                    preload="auto"
                    draggable="false"
                  >
                    <source src={mediaLink} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <LoadingSpinner padding={false} />
              )}
            </div>
          )}
        </div>

        <div className="order-1 order-lg-2">
          <h2 className="fs-5 mb-1 fw-semibold">{title}</h2>
          <p className="fw-medium fs-7 opacity-75">{description}</p>
        </div>

        <div className="row g-2 order-2 order-lg-3">
          {mediaTokens.map((token, index) => {
            const media = mediaData[token];
            const mediaLink = media?.public_bucket_path
              ? new BucketConfig().getGcsUrl(media.public_bucket_path)
              : null;

            return (
              <ThumbnailItem
                key={index}
                index={index}
                selectedIndex={selectedIndex}
                handleThumbnailClick={handleThumbnailClick}
                poster={mediaLink || ""}
                mediaType={media?.media_type}
              />
            );
          })}

          {/* <div className="col-3">
            <div className="lp-thumbnail lp-add-media ratio ratio-1x1">
              <div className="d-flex gap-1 flex-column align-items-center justify-content-center">
                <FontAwesomeIcon icon={faCirclePlus} className="fs-4 mt-1" />
                <span className="fw-medium mb-0 user-select-none fs-7">
                  Upload
                </span>
              </div>
            </div>
          </div> */}
        </div>

        <Button
          icon={faUpload}
          label="Upload your own"
          variant="secondary"
          className="order-3 order-lg-4"
        />
      </div>
    );
  }
);

export default ThumbnailMediaPicker;
