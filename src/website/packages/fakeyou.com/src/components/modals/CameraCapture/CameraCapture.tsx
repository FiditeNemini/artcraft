import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { a, TransitionFn, useSpring, useTransition } from "@react-spring/web";
import { WorkIndicator } from "components/svg";
import { useInterval, useMediaUploader } from "hooks";
import { UploaderResponse } from "components/entities/EntityTypes";
import {
  Button,
  ModalUtilities,
  Spinner,
  SegmentButtons,
} from "components/common";
import { faClose } from "@fortawesome/pro-solid-svg-icons";
import { isMobile } from "react-device-detect";
import CapturePreview from "./CapturePreview";
import "./CameraCapture.scss";

interface CameraCaptureProps extends ModalUtilities {
  GApage?: string;
  selectToken: (token: string) => void;
}

export default function CameraCapture({
  handleClose,
  GApage,
  selectToken,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, capturingSet] = useState(false);
  const [recordedChunks, recordedChunksSet] = useState([]);
  const [counter, counterSet] = useState(0);
  const [blob, blobSet] = useState<Blob | null>(null);
  const [cameraStarted, cameraStartedSet] = useState(false);
  const [cameraPosition, cameraPositionSet] = useState("user");

  const hours = Math.floor(counter / 3600);
  const minutes = Math.floor((counter - hours * 3600) / 60);
  const seconds = counter - hours * 3600 - minutes * 60;

  const timeString =
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        recordedChunksSet(prev => prev.concat(data));
      }
    },
    [recordedChunksSet]
  );

  const mainToggleClick = () => {
    if (!capturing) {
      capturingSet(true);

      if (webcamRef.current && webcamRef.current.stream) {
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
          mimeType: "video/mp4",
        });

        mediaRecorderRef.current.addEventListener(
          "dataavailable",
          handleDataAvailable
        );
        mediaRecorderRef.current.start();
      }
    } else {
      capturingSet(false);

      if (mediaRecorderRef.current !== null) {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const mainToggleStyle = useSpring({
    rx: capturing ? 1 : 8,
    size: capturing ? 14 : 16,
    xy: capturing ? 9 : 8,
  });

  const resetCapture = () => {
    cameraStartedSet(false);
    blobSet(null);
    recordedChunksSet([]);
    counterSet(0);
  };

  const {
    busy: uploaderBusy,
    createUpload,
    error: uploaderError,
    uploadProgress,
  } = useMediaUploader({
    onError: () => {
      // @ts-ignore
      window.dataLayer.push({
        "event": "upload_failure_webcam",
        "page": GApage || "/",
        "user_id": "$user_id"
      });
    },
    onSuccess: (res: UploaderResponse) => {
      handleClose();
      selectToken(res.media_file_token);
    },
  });

  const index = uploaderError
    ? 3
    : uploaderBusy
      ? 2
      : blob && !capturing
        ? 1
        : 0;

  const upload = () => {
    if (blob) {
      const file = new File([blob], "test-upload.mp4", { type: "video/mp4" });
      createUpload(file);
    }
  };

  const transitions: TransitionFn<
    number,
    { opacity: number; transform: string }
  > = useTransition(index, {
    config: { mass: 1, tension: 80, friction: 10 },
    from: { opacity: 0, transform: `translateX(${5}rem)` },
    enter: { opacity: 1, transform: `translateX(0)` },
    leave: { opacity: 0, transform: `translateX(${5}rem)` },
  });

  const cameraOptions = [
    { label: "Selfie camera", value: "user" },
    { label: "Rear camera", value: "enviroment" },
  ];

  useInterval({
    eventProps: { capturing, counter },
    interval: 1000,
    locked: !capturing,
    onTick: () => {
      if (capturing) {
        counterSet(currentCounter => currentCounter + 1);
      }
    },
  });

  useEffect(() => {
    if (!blob && !capturing && recordedChunks.length) {
      blobSet(
        new Blob(recordedChunks, {
          type: "video/mp4",
        })
      );
    }
  }, [blob, capturing, recordedChunks]);

  return (
    <div
      {...{
        className: "fy-camera-capture-modal",
      }}
    >
      <Button
        {...{
          className: "fy-camera-capture-close",
          icon: faClose,
          onClick: () => handleClose(),
          square: true,
        }}
      />
      {transitions((style: any, i: number) => {
        return [
          <a.div {...{ className: "fy-camera-capture-slide", style }}>
            <Webcam
              audio
              {...{
                muted: true,
                className: "fy-camera-capture-display",
                onUserMedia: () => cameraStartedSet(true),
                ref: webcamRef,
                videoConstraints: {
                  width: 512,
                  height: 512,
                  facingMode:
                    cameraPosition === "user"
                      ? cameraPosition
                      : { exact: cameraPosition },
                },
              }}
            />
            {cameraStarted ? (
              <div {...{ className: "fy-camera-capture-controls" }}>
                <button
                  {...{
                    className: "fy-camera-capture-record-toggle",
                    onClick: mainToggleClick,
                  }}
                >
                  <svg
                    {...{
                      className: capturing
                        ? "fy-camera-capture-btn-stop"
                        : "fy-camera-capture-btn-record",
                    }}
                  >
                    <circle
                      {...{
                        cx: 16,
                        cy: 16,
                        r: 15,
                      }}
                    />
                    <a.rect
                      {...{
                        x: mainToggleStyle.xy,
                        y: mainToggleStyle.xy,
                        height: mainToggleStyle.size,
                        width: mainToggleStyle.size,
                        rx: mainToggleStyle.rx,
                      }}
                    />
                  </svg>
                  {capturing ? timeString : "Record"}
                </button>
                {isMobile && (
                  <SegmentButtons
                    {...{
                      value: cameraPosition,
                      onChange: ({ target }: { target: { value: string } }) =>
                        cameraPositionSet(target.value),
                      options: cameraOptions,
                    }}
                  />
                )}
              </div>
            ) : (
              <div {...{ className: "fy-camera-capture-centered" }}>
                <Spinner />
              </div>
            )}
          </a.div>,

          <CapturePreview
            {...{
              blob,
              resetCapture,
              style,
              upload,
            }}
          />,
          <a.div
            {...{
              className: "fy-camera-capture-slide fy-camera-capture-centered",
              style,
            }}
          >
            <WorkIndicator
              {...{
                failure: false,
                label: "Uploading",
                max: 100,
                progressPercentage: uploadProgress,
                stage: 1,
                showPercentage: true,
                success: false,
              }}
            />
          </a.div>,
          <a.div
            {...{
              className: "fy-camera-capture-slide fy-camera-capture-centered",
              style,
            }}
          >
            error
          </a.div>,
        ][i];
      })}
    </div>
  );
}
