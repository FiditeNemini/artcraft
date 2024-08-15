import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useInferenceJobs, useModal } from "hooks";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { AITools } from "components/marketing";
import { EntityInput } from "components/entities";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import LoadingSpinner from "components/common/LoadingSpinner";
import SessionLpInferenceResultsList from "./SessionLpInferenceResultsList";
import { GetMedia } from "@storyteller/components/src/api/media_files/GetMedia";
import { useLocation } from "react-router-dom";

interface LivePortraitProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

interface GeneratedVideo {
  sourceIndex: number;
  motionIndex: number;
  videoSrc: string;
}

export default function LivePortrait({
  sessionSubscriptionsWrapper,
}: LivePortraitProps) {
  const { enqueueInferenceJob } = useInferenceJobs();
  const { open, close } = useModal();
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
  const [generatedVideoSrc, setGeneratedVideoSrc] = useState("");
  const [sourceTokens, setSourceTokens] = useState<string[]>([
    "m_2xrse9799wvy8hkv8tbxqxct8089t7",
  ]);
  const [motionTokens, setMotionTokens] = useState<string[]>([
    "m_z278r5b1r2279xqkxszxjkqhc1dg2g",
    "m_dv9pcmmwdpgyevyxsyxcahkhd2c839",
  ]);
  const numberOfInitialSourceTokensRef = useRef(sourceTokens.length);
  const numberOfInitialSourceTokens = numberOfInitialSourceTokensRef.current;
  const numberOfInitialMotionTokensRef = useRef(motionTokens.length);
  const numberOfInitialMotionTokens = numberOfInitialMotionTokensRef.current;
  const [userSourceToken, setUserSourceToken] = useState<string>("");
  const [userMotionToken, setUserMotionToken] = useState<string>("");
  const [isUserUploaded, setIsUserUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  const location = useLocation();

  const precomputedVideos = useMemo(
    () => [
      {
        src: "/videos/live-portrait/1_1.mp4",
      },
      {
        src: "/videos/live-portrait/1_2.mp4",
      },
    ],
    []
  );

  const handleSourceSelect = (index: number) => {
    console.log("Thumbnail clicked:", index);
    setIsUserUploaded(index >= numberOfInitialSourceTokens);
    setSelectedSourceIndex(index);
  };

  const handleMotionSelect = (index: number) => {
    console.log("Thumbnail clicked:", index);
    setSelectedMotionIndex(index);
  };

  const enqueueClick = () => {
    setIsEnqueuing(true);
    setIsGenerating(true);
    EnqueueFaceMirror("", {
      creator_set_visibility: visibility,
      face_driver_media_file_token: motionTokens[selectedMotionIndex],
      maybe_crop: cropArea,
      remove_watermark: removeWatermark,
      source_media_file_token: sourceTokens[selectedSourceIndex],
      uuid_idempotency_token: uuidv4(),
    }).then((res: EnqueueFaceMirrorResponse) => {
      if (res.success && res.inference_job_token) {
        enqueueInferenceJob(
          res.inference_job_token,
          FrontendInferenceJobType.TextToSpeech,
          false
        );

        console.log("Job enqueued:", res.inference_job_token);
      } else {
        console.error("Failed to enqueue job", res);
        setIsGenerating(false);
      }
      setIsEnqueuing(false);
    });
  };

  const renderVideoOrPlaceholder = () => {
    if (generatedVideoSrc) {
      return (
        <video
          loop
          autoPlay
          muted
          playsInline
          controls={true}
          preload="auto"
          key={generatedVideoSrc}
        >
          <source src={generatedVideoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (videoSrc) {
      return (
        <video
          loop
          autoPlay
          muted
          playsInline
          controls={true}
          preload="auto"
          key={videoSrc}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isGenerating) {
      return (
        <div className="w-100 h-100 position-relative">
          <div
            className="position-absolute"
            style={{
              textAlign: "center",
              width: "100%",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <h4 className="fw-medium">
              <div className="d-flex flex-column align-items-center gap-3 justify-content-center">
                <LoadingSpinner padding={false} />
                Generating video...
              </div>
            </h4>
          </div>
          <img
            src={selectedSourceMediaLink || ""}
            alt="Preview"
            style={{ opacity: 0.15 }}
            draggable={false}
          />
        </div>
      );
    } else {
      return (
        <div className="w-100 h-100 position-relative">
          <div
            className="position-absolute"
            style={{
              textAlign: "center",
              width: "100%",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <h4 className="fw-medium">
              Click{" "}
              <b>
                <FontAwesomeIcon icon={faSparkles} className="me-2 fs-6" />
                Animate
              </b>{" "}
              to start generating
            </h4>
          </div>
          <img
            src={selectedSourceMediaLink || ""}
            alt="Preview"
            style={{ opacity: 0.15 }}
            draggable={false}
          />
        </div>
      );
    }
  };

  const getPrecomputedVideoSrc = useCallback(() => {
    const index = selectedSourceIndex * 4 + selectedMotionIndex;
    if (index >= 0 && index < precomputedVideos.length) {
      return precomputedVideos[index].src;
    }
    return "";
  }, [selectedSourceIndex, selectedMotionIndex, precomputedVideos]);

  useEffect(() => {
    if (isUserUploaded) {
      setVideoSrc("");
    } else {
      const newSrc = getPrecomputedVideoSrc();
      setVideoSrc(newSrc);
    }
  }, [
    selectedSourceIndex,
    selectedMotionIndex,
    isUserUploaded,
    getPrecomputedVideoSrc,
  ]);

  useEffect(() => {
    if (userSourceToken) {
      setSourceTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(userSourceToken);
        if (tokenIndex !== -1) {
          setSelectedSourceIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialSourceTokens);
          return prevTokens;
        } else {
          const updatedTokens = [...prevTokens, userSourceToken];
          setSelectedSourceIndex(updatedTokens.length - 1);
          setIsUserUploaded(true);
          return updatedTokens;
        }
      });
      setUserSourceToken("");
    }
  }, [userSourceToken, numberOfInitialSourceTokens]);

  useEffect(() => {
    if (userMotionToken) {
      setMotionTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(userMotionToken);
        if (tokenIndex !== -1) {
          setSelectedMotionIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialMotionTokens);
          return prevTokens;
        } else {
          const updatedTokens = [...prevTokens, userMotionToken];
          setSelectedMotionIndex(updatedTokens.length - 1);
          setIsUserUploaded(true);
          return updatedTokens;
        }
      });
      setUserMotionToken("");
    }
  }, [userMotionToken, numberOfInitialMotionTokens]);

  const isUserContent =
    selectedSourceIndex >= numberOfInitialSourceTokens ||
    selectedMotionIndex >= numberOfInitialMotionTokens;

  const sourceInputProps = {
    accept: ["image", "video"],
    className: "w-100",
    label: "Upload Source Media (Image or Video)",
    onChange: ({ target }: { target: any }) => {
      setUserSourceToken(target.value);
      close();
    },
    type: "media",
  };

  const motionInputProps = {
    accept: ["image", "video"],
    className: "w-100",
    label: "Upload Source Media (Image or Video)",
    onChange: ({ target }: { target: any }) => {
      setUserMotionToken(target.value);
      close();
    },
    type: "media",
  };

  const handleOpenUploadSourceModal = () => {
    open({
      component: EntityInput,
      props: sourceInputProps,
      width: "small",
    });
  };

  const handleOpenUploadMotionModal = () => {
    open({
      component: EntityInput,
      props: motionInputProps,
      width: "small",
    });
  };

  const [selectedSourceMedia, setSelectedSourceMedia] = useState<{
    [key: string]: any;
  }>({});

  const handleSelectedMediaChange = (media: any) => {
    setSelectedSourceMedia(media);
  };

  const selectedSourceMediaLink = selectedSourceMedia?.public_bucket_path
    ? new BucketConfig().getGcsUrl(selectedSourceMedia.public_bucket_path)
    : null;

  const handleJobTokens = async (
    maybeResultToken: string,
    jobToken: string
  ) => {
    console.log("Maybe Result Token:", maybeResultToken);
    console.log("Job Token:", jobToken);

    const response = await GetMedia(maybeResultToken, {});

    if (
      response &&
      response.media_file &&
      response.media_file.public_bucket_path
    ) {
      const mediaLink = new BucketConfig().getGcsUrl(
        response.media_file.public_bucket_path
      );

      const isSourceValid = selectedSourceIndex < sourceTokens.length;
      const isMotionValid = selectedMotionIndex < motionTokens.length;

      if (isSourceValid && isMotionValid) {
        const generatedVideo = {
          sourceIndex: selectedSourceIndex,
          motionIndex: selectedMotionIndex,
          videoSrc: mediaLink,
        };

        // Update the state with the new combination
        setGeneratedVideos(prevGeneratedVideos => [
          ...prevGeneratedVideos,
          generatedVideo,
        ]);

        // Only set generatedVideoSrc if it matches the current selected indices
        if (
          selectedSourceIndex === generatedVideo.sourceIndex &&
          selectedMotionIndex === generatedVideo.motionIndex
        ) {
          setGeneratedVideoSrc(mediaLink);
          setIsGenerating(false);
        }
      }
    } else {
      console.error(
        "Failed to retrieve media or media has no public bucket path",
        response
      );
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const getVideoForCombination = (
      sourceIndex: number,
      motionIndex: number
    ) => {
      const video = generatedVideos.find(
        video =>
          video.sourceIndex === sourceIndex && video.motionIndex === motionIndex
      );
      return video ? video.videoSrc : null;
    };

    const existingVideoSrc = getVideoForCombination(
      selectedSourceIndex,
      selectedMotionIndex
    );

    if (existingVideoSrc) {
      // Show the generated video that matches the current selection
      setGeneratedVideoSrc(existingVideoSrc);
      setIsGenerating(false);
    } else if (!isUserUploaded) {
      // Show the precomputed video if no user-uploaded content is present
      const newSrc = getPrecomputedVideoSrc();
      setVideoSrc(newSrc);
      setGeneratedVideoSrc("");
      setIsGenerating(false);
    } else {
      // Clear the videoSrc and generatedVideoSrc if no match is found
      setVideoSrc("");
      setGeneratedVideoSrc("");
    }
  }, [
    selectedSourceIndex,
    selectedMotionIndex,
    isUserUploaded,
    generatedVideos,
    getPrecomputedVideoSrc,
  ]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sourceToken = queryParams.get("source");
    const motionToken = queryParams.get("motion");

    if (sourceToken) {
      setSourceTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(sourceToken);
        if (tokenIndex !== -1) {
          setSelectedSourceIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialSourceTokens);
          return prevTokens;
        } else {
          const updatedTokens = [...prevTokens, sourceToken];
          setSelectedSourceIndex(updatedTokens.length - 1);
          setIsUserUploaded(true);
          return updatedTokens;
        }
      });
    }

    if (motionToken) {
      setMotionTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(motionToken);
        if (tokenIndex !== -1) {
          setSelectedMotionIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialMotionTokens);
          return prevTokens;
        } else {
          const updatedTokens = [...prevTokens, motionToken];
          setSelectedMotionIndex(updatedTokens.length - 1);
          setIsUserUploaded(true);
          return updatedTokens;
        }
      });
    }
  }, [
    location.search,
    numberOfInitialSourceTokens,
    numberOfInitialMotionTokens,
  ]);

  const uploadFocusPointSource = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    const sourceToken = queryParams.get("source");
    const motionToken = queryParams.get("motion");

    if (motionToken && !sourceToken) {
      return true;
    } else if (!motionToken && sourceToken) {
      return false;
    } else {
      return false;
    }
  }, [location.search]);

  const uploadFocusPointMotion = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    const sourceToken = queryParams.get("source");
    const motionToken = queryParams.get("motion");

    if (sourceToken && !motionToken) {
      return true;
    } else if (!sourceToken && motionToken) {
      return false;
    } else {
      return false;
    }
  }, [location.search]);

  return (
    <>
      <Container type="panel" className="mt-3">
        <Panel padding={true}>
          <h1 className="fw-bold fs-1 mb-0">
            <FontAwesomeIcon icon={faImageUser} className="me-3 fs-2" />
            Live Portrait
          </h1>
          <p className="opacity-75 fw-medium mb-3 mb-lg-0">
            Use AI to transfer facial expressions, audio, and vocals from one
            face video to an image or video.
          </p>
          <div>
            <div className="row gx-0 gy-4">
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
                  stepNumber={1}
                  onUploadClick={handleOpenUploadSourceModal}
                  onSelectedMediaChange={handleSelectedMediaChange}
                  uploadFocusPoint={uploadFocusPointSource}
                />
              </div>

              <div className="col-12 col-lg-1 d-flex justify-content-center lp-section-between">
                <FontAwesomeIcon
                  icon={faPlus}
                  className="display-3 opacity-75"
                />
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
                  stepNumber={2}
                  onUploadClick={handleOpenUploadMotionModal}
                  uploadFocusPoint={uploadFocusPointMotion}
                />
              </div>

              <div className="col-12 col-lg-1 d-flex justify-content-center lp-section-between">
                <FontAwesomeIcon
                  icon={faEquals}
                  className="display-3 opacity-75 d-none d-lg-block"
                />
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="display-3 opacity-75 d-block d-lg-none"
                />
              </div>

              <div className="col-12 col-lg-4 d-flex gap-3 flex-column">
                <div className="lp-media">
                  {renderVideoOrPlaceholder()}

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

                <div className="d-flex flex-column gap-4">
                  <div className="d-flex gap-2">
                    <Button
                      icon={faSparkles}
                      label={
                        isUserContent
                          ? "Animate"
                          : "Upload your media to generate"
                      }
                      onClick={enqueueClick}
                      className="flex-grow-1"
                      // disabled={!isUserContent}
                      isLoading={isEnqueuing || isGenerating}
                      disabled={!isUserContent}
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
                  <div className="d-flex gap-3">
                    <Checkbox
                      label={"Make Private"}
                      onChange={() => {
                        setVisibility(prevVisibility =>
                          prevVisibility === "private" ? "public" : "private"
                        );
                      }}
                      checked={visibility === "private"}
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
                </div>
              </div>
              <div className="mt-5 pt-5 order-3">
                <Label label="Latest Outputs" />
                <div>
                  <SessionLpInferenceResultsList
                    sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                    onJobTokens={handleJobTokens}
                  />
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </Container>

      <Container type="panel" className="pt-5 mt-5">
        <Panel clear={true}>
          <h2 className="fw-bold mb-3">Try other AI video tools</h2>
          <AITools />
        </Panel>
      </Container>
    </>
  );
}
