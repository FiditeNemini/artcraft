import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Label,
  Panel,
} from "components/common";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowDownToLine,
  faEquals,
  faImageUser,
  faPlus,
  faSparkles,
} from "@fortawesome/pro-solid-svg-icons";
import "./LivePortrait.scss";
import ThumbnailMediaPicker from "./ThumbnailMediaPicker";
import {
  EnqueueFaceMirror,
  EnqueueFaceMirrorResponse,
  MediaFileCropArea,
} from "@storyteller/components/src/api/workflows/EnqueueFaceMirror";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { v4 as uuidv4 } from "uuid";
import { useInferenceJobs } from "hooks";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";

interface LivePortraitProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function LivePortrait({
  sessionSubscriptionsWrapper,
}: LivePortraitProps) {
  const { enqueue } = useInferenceJobs();
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [selectedMotionIndex, setSelectedMotionIndex] = useState(0);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [visibility, setVisibility] = useState<"private" | "public">("public");
  const [cropArea, setCropArea] = useState<MediaFileCropArea>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });
  const hasPremium = sessionSubscriptionsWrapper.hasPaidFeatures();
  const [videoSrc, setVideoSrc] = useState("");

  const sourceTokens = ["m_f68s71xwm1r8y2rv4q0xb4dmc4nx9f"];

  const motionTokens = [
    "m_x2t1kvyzw677b6kr5me2g4vcra4308",
    "m_hv1n7nqbq5dmfmzcn1eyy1qw4mskvs",
  ];

  const precomputedVideos = [
    {
      src: "/videos/live-portrait/1_1.mp4",
    },
    {
      src: "/videos/live-portrait/1_2.mp4",
    },
  ];

  const handleSourceSelect = (index: number) => {
    console.log("Thumbnail clicked:", index);
    setSelectedSourceIndex(index);
  };

  const handleMotionSelect = (index: number) => {
    console.log("Thumbnail clicked:", index);
    setSelectedMotionIndex(index);
  };

  const enqueueClick = () => {
    setIsEnqueuing(true);
    EnqueueFaceMirror("", {
      creator_set_visibility: visibility,
      face_driver_media_file_token: motionTokens[selectedMotionIndex],
      maybe_crop: cropArea,
      remove_watermark: removeWatermark,
      source_media_file_token: sourceTokens[selectedSourceIndex],
      uuid_idempotency_token: uuidv4(),
    }).then((res: EnqueueFaceMirrorResponse) => {
      if (res.success && res.inference_job_token) {
        enqueue(
          res.inference_job_token,
          FrontendInferenceJobType.VideoStyleTransfer,
          false
        );
      } else {
        console.error("Failed to enqueue job", res);
      }
      setIsEnqueuing(false);
    });
  };

  const getPrecomputedVideoSrc = () => {
    const index = selectedSourceIndex * 4 + selectedMotionIndex;
    return precomputedVideos[index].src;
  };

  useEffect(() => {
    setVideoSrc(getPrecomputedVideoSrc());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceIndex, selectedMotionIndex]);

  const isUserContent =
    selectedSourceIndex >= sourceTokens.length ||
    selectedMotionIndex >= motionTokens.length;

  return (
    <Container type="panel" className="mt-3 mt-lg-5">
      <Panel padding={true}>
        <h1 className="fw-bold fs-1 mb-0">
          <FontAwesomeIcon icon={faImageUser} className="me-3 fs-2" />
          Live Portrait
        </h1>
        <p className="opacity-75 fw-medium mb-3 mb-lg-0">
          Use AI to transfer facial expressions, audio, and vocals from one face
          video to an image or video.
        </p>
        <div className="row gx-0 gy-4 ">
          <div
            className="col-12 col-lg-3 d-flex gap-3 flex-column"
            style={{ paddingTop: "4.2%" }}
          >
            <ThumbnailMediaPicker
              mediaTokens={sourceTokens}
              selectedIndex={selectedSourceIndex}
              handleThumbnailClick={handleSourceSelect}
              title="Select Source"
              description="This image or video is what the final video will look like."
              badgeLabel="Source Media"
            />
          </div>

          <div className="col-12 col-lg-1 d-flex justify-content-center lp-section-between">
            <FontAwesomeIcon icon={faPlus} className="display-4 opacity-75" />
          </div>

          <div
            className="col-12 col-lg-3 d-flex gap-3 flex-column"
            style={{ paddingTop: "4.2%" }}
          >
            <ThumbnailMediaPicker
              mediaTokens={motionTokens}
              selectedIndex={selectedMotionIndex}
              handleThumbnailClick={handleMotionSelect}
              title="Select Motion Reference"
              description="This is what the face video will move like (contains audio)."
              badgeLabel="Motion Reference"
              cropper={true}
              cropArea={cropArea}
              setCropArea={setCropArea}
            />
          </div>

          <div className="d-none col-12 col-lg-1 d-lg-flex justify-content-center lp-section-between">
            <FontAwesomeIcon
              icon={faEquals}
              className="display-4 opacity-75 d-none d-lg-block"
            />
          </div>

          <div className="col-12 col-lg-4 d-flex gap-3 justify-content-center flex-column">
            <div className="lp-media order-2 order-lg-1">
              <video
                loop
                autoPlay
                muted
                playsInline
                controls={true}
                preload="auto"
                key={videoSrc}
              >
                <source src={getPrecomputedVideoSrc()} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="lp-tag">
                <div className="d-flex gap-2 w-100">
                  <Badge
                    label="Output Video"
                    color="ultramarine"
                    overlay={true}
                  />
                  {!isUserContent && (
                    <Badge
                      label="Pre-generated Example"
                      color="gray"
                      overlay={true}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 order-1 order-lg-2">
              <div className="d-flex gap-3">
                <Checkbox
                  label={"Make Public"}
                  onChange={() => {
                    setVisibility(prevVisibility =>
                      prevVisibility === "public" ? "private" : "public"
                    );
                  }}
                  checked={visibility === "public"}
                />

                <div className="d-flex">
                  <Checkbox
                    disabled={!hasPremium}
                    label={"Remove Watermark"}
                    onChange={() => {
                      setRemoveWatermark(
                        prevRemoveWatermark => !prevRemoveWatermark
                      );
                    }}
                    checked={removeWatermark}
                  />
                  {/* <div {...{ className: "fy-ai-face-mirror-premium-label" }}>
                    Watermark
                    {!hasPremium ? (
                      <Link {...{ to: "pricing" }}> subscribe to remove</Link>
                    ) : null}
                  </div> */}
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  icon={faSparkles}
                  label="Generate Live Portrait"
                  onClick={enqueueClick}
                  className="flex-grow-1"
                  // disabled={!isUserContent}
                  isLoading={isEnqueuing}
                />
                <Tippy theme="fakeyou" content="Download video">
                  <div>
                    <Button
                      square={true}
                      icon={faArrowDownToLine}
                      variant="action"
                    />
                  </div>
                </Tippy>
              </div>
              <div className="col-12 col-lg-1 d-flex d-lg-none justify-content-center lp-section-between my-3">
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="display-4 opacity-75"
                />
              </div>
            </div>

            <div className="mt-2 order-3">
              <Label label="Output" />
              <div className="panel panel-inner rounded p-3">Jobs</div>
              <div className="panel panel-inner rounded p-3">Jobs</div>
              <div className="panel panel-inner rounded p-3">Jobs</div>
            </div>
          </div>
        </div>
      </Panel>
    </Container>
  );
}
