import React, { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { a, useSpring } from "@react-spring/web";
// import { MediaRecorder, IMediaRecorder } from "extendable-media-recorder";
import "./CameraCapture.scss";

import { ModalUtilities } from "components/common";

// interface Props {
//   value?: any;
// }

export default function CameraCapture({ handleClose }: ModalUtilities) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [capturing, capturingSet] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks(prev => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      // a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const mainToggleClick = () => {
    if (!capturing) {
      capturingSet(true);

      if (webcamRef.current && webcamRef.current.stream) {
        console.log("🧢", webcamRef.current.stream);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
          mimeType: "video/webm",
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

  return (
    <div
      {...{
        className: "fy-camera-capture-modal",
      }}
    >
      <Webcam
        audio
        {...{
          audioConstraints: {
            sampleSize: 16,
            channelCount: 2,
          },
          className: "fy-camera-capture-display",
          ref: webcamRef,
          videoConstraints: {
            width: 512,
            height: 512,
            facingMode: "user",
          },
        }}
      />
      <div {...{ className: "fy-camera-capture-controls" }}>
        <button
          {...{
            className: "fy-camera-capture-record-toggle",
            onClick: mainToggleClick,
          }}
        >
          <svg>
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
          Record
        </button>
        {recordedChunks.length > 0 && (
          <button onClick={handleDownload}>Download</button>
        )}
      </div>
      {/*      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleDownload}>Download</button>
      )}*/}
    </div>
  );
}
