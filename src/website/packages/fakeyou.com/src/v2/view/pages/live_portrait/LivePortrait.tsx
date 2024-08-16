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
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { AITools } from "components/marketing";
import { EntityInput } from "components/entities";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import LoadingSpinner from "components/common/LoadingSpinner";
import SessionLpInferenceResultsList from "./SessionLpInferenceResultsList";
import { GetMedia } from "@storyteller/components/src/api/media_files/GetMedia";
import { useLocation } from "react-router-dom";
import { LivePortraitDetails } from "@storyteller/components/src/api/model_inference/GetModelInferenceJobStatus";

interface LivePortraitProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

interface GeneratedVideo {
  sourceIndex: number;
  motionIndex: number;
  sourceToken: string;
  motionToken: string;
  videoSrc: string;
  jobToken: string;
  createdAt: Date;
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
  const [jobProcessedTokens, setJobProcessedTokens] = useState<string[]>([]);
  const [currentlyGeneratingList, setCurrentlyGeneratingList] = useState<
    { sourceIndex: number; motionIndex: number }[]
  >([]);

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

  const handleJobClick = (job: InferenceJob) => {
    const livePortraitDetails = job.maybeLivePortraitDetails;
    if (livePortraitDetails) {
      const sourceIndex = sourceTokens.indexOf(
        livePortraitDetails.source_media_file_token
      );
      const motionIndex = motionTokens.indexOf(
        livePortraitDetails.face_driver_media_file_token
      );

      if (sourceIndex !== -1) {
        setSelectedSourceIndex(sourceIndex);
      } else {
        setSourceTokens(prevTokens => [
          ...prevTokens,
          livePortraitDetails.source_media_file_token,
        ]);
        setSelectedSourceIndex(sourceTokens.length);
      }

      if (motionIndex !== -1) {
        setSelectedMotionIndex(motionIndex);
      } else {
        setMotionTokens(prevTokens => [
          ...prevTokens,
          livePortraitDetails.face_driver_media_file_token,
        ]);
        setSelectedMotionIndex(motionTokens.length);
      }
    }
  };

  const handleSourceSelect = (index: number) => {
    setIsUserUploaded(index >= numberOfInitialSourceTokens);
    setSelectedSourceIndex(index);
  };

  const handleMotionSelect = (index: number) => {
    setIsUserUploaded(index >= numberOfInitialMotionTokens);
    setSelectedMotionIndex(index);
  };

  const enqueueClick = () => {
    // Clear the generated video when reanimating
    setGeneratedVideoSrc("");
    setIsGenerating(true);

    // Add the current source and motion combination to the generating list
    setCurrentlyGeneratingList(prevList => [
      ...prevList,
      { sourceIndex: selectedSourceIndex, motionIndex: selectedMotionIndex },
    ]);

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
        enqueueInferenceJob(
          res.inference_job_token,
          FrontendInferenceJobType.LivePortrait,
          false
        );

        console.log("Job enqueued:", res.inference_job_token);
      } else {
        console.error("Failed to enqueue job", res);
        setIsGenerating(false);
        // Remove the combination from currentlyGeneratingList if fail
        setCurrentlyGeneratingList(prevList =>
          prevList.filter(
            gen =>
              gen.sourceIndex !== selectedSourceIndex ||
              gen.motionIndex !== selectedMotionIndex
          )
        );
      }
      setIsEnqueuing(false);
    });
  };

  const renderVideoOrPlaceholder = () => {
    // Check if the current combination is being generated
    const isCurrentlyGenerating = currentlyGeneratingList.some(
      gen =>
        gen.sourceIndex === selectedSourceIndex &&
        gen.motionIndex === selectedMotionIndex
    );

    if (isCurrentlyGenerating) {
      // Show "Generating Video..." if the combination is currently generating
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
    } else if (generatedVideoSrc) {
      // Show dynamically generated video if available
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
    } else if (getPrecomputedVideoSrc()) {
      // Show precomputed video if it exists
      return (
        <video
          loop
          autoPlay
          muted
          playsInline
          controls={true}
          preload="auto"
          key={getPrecomputedVideoSrc()}
        >
          <source src={getPrecomputedVideoSrc()} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      // Show "Click to Animate" if nothing is generating or precomputed
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
    accept: ["video"],
    className: "w-100",
    label: "Upload Motion Reference Video",
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
    jobToken: string,
    createdAt: Date,
    livePortraitDetails?: LivePortraitDetails
  ) => {
    if (jobProcessedTokens.includes(jobToken)) {
      return;
    }

    if (!livePortraitDetails) {
      return;
    }

    const response = await GetMedia(maybeResultToken, {});

    if (
      response &&
      response.media_file &&
      response.media_file.public_bucket_path
    ) {
      const mediaLink = new BucketConfig().getGcsUrl(
        response.media_file.public_bucket_path
      );

      const sourceIndex = sourceTokens.indexOf(
        livePortraitDetails.source_media_file_token
      );
      const motionIndex = motionTokens.indexOf(
        livePortraitDetails.face_driver_media_file_token
      );

      const newGeneratedVideo = {
        sourceIndex,
        motionIndex,
        sourceToken: livePortraitDetails.source_media_file_token,
        motionToken: livePortraitDetails.face_driver_media_file_token,
        videoSrc: mediaLink,
        jobToken, // Store the job token with the video
        createdAt,
      };

      setGeneratedVideos(prevGeneratedVideos => {
        const existingVideoIndex = prevGeneratedVideos.findIndex(
          video =>
            video.sourceIndex === newGeneratedVideo.sourceIndex &&
            video.motionIndex === newGeneratedVideo.motionIndex
        );

        if (existingVideoIndex !== -1) {
          const existingVideo = prevGeneratedVideos[existingVideoIndex];

          // Replace the existing video only if the new jobToken is more recent
          if (
            new Date(existingVideo.createdAt).getTime() <
            new Date(newGeneratedVideo.createdAt).getTime()
          ) {
            const updatedVideos = [...prevGeneratedVideos];
            updatedVideos[existingVideoIndex] = newGeneratedVideo;
            return updatedVideos;
          }
          return prevGeneratedVideos;
        } else {
          // Add the new video if it doesn't already exist
          return [...prevGeneratedVideos, newGeneratedVideo];
        }
      });

      // Set the new video for display if it's the latest
      if (
        selectedSourceIndex === newGeneratedVideo.sourceIndex &&
        selectedMotionIndex === newGeneratedVideo.motionIndex
      ) {
        setGeneratedVideoSrc(mediaLink);
        setIsGenerating(false);

        // Remove from generating list as job is complete
        setCurrentlyGeneratingList(prevList =>
          prevList.filter(
            gen =>
              gen.sourceIndex !== newGeneratedVideo.sourceIndex ||
              gen.motionIndex !== newGeneratedVideo.motionIndex
          )
        );
      }

      // Mark the job as processed
      setJobProcessedTokens(prevTokens => [...prevTokens, jobToken]);
    } else {
      console.error(
        "Failed to retrieve media or media has no public bucket path",
        response
      );
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const getLatestVideoForCombination = (
      sourceIndex: number,
      motionIndex: number
    ) => {
      // Filter generated videos by sourceIndex and motionIndex
      const matchingVideos = generatedVideos.filter(
        video =>
          video.sourceIndex === sourceIndex && video.motionIndex === motionIndex
      );

      // Sort the videos by createdAt to get the latest one
      const sortedVideos = matchingVideos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Return the latest video source if it exists
      return sortedVideos.length > 0 ? sortedVideos[0].videoSrc : null;
    };

    const latestVideoSrc = getLatestVideoForCombination(
      selectedSourceIndex,
      selectedMotionIndex
    );

    if (latestVideoSrc) {
      setGeneratedVideoSrc(latestVideoSrc);
      setIsGenerating(false);
    } else if (!isUserUploaded) {
      setGeneratedVideoSrc("");
      setIsGenerating(false);
    } else {
      setGeneratedVideoSrc("");
    }
  }, [
    selectedSourceIndex,
    selectedMotionIndex,
    generatedVideos,
    isUserUploaded,
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

  useEffect(() => {
    // When switching source or motion indexes, check if the current combination is generating
    const isCurrentlyGenerating = currentlyGeneratingList.some(
      gen =>
        gen.sourceIndex === selectedSourceIndex &&
        gen.motionIndex === selectedMotionIndex
    );

    if (isCurrentlyGenerating) {
      setIsGenerating(true);
    } else if (generatedVideoSrc) {
      setIsGenerating(false);
    } else if (!isUserUploaded) {
      setIsGenerating(false);
    } else {
      setIsGenerating(false);
    }
  }, [
    selectedSourceIndex,
    selectedMotionIndex,
    currentlyGeneratingList,
    generatedVideoSrc,
    isUserUploaded,
  ]);

  const handleDownloadClick = () => {
    if (generatedVideoSrc) {
      const link = document.createElement("a");
      link.href = generatedVideoSrc;
      link.download = "output_video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("No video source available for download");
    }
  };

  return (
    <>
      <Container type="panel" className="mt-3 mt-lg-5">
        <Panel padding={true}>
          <h1 className="fw-bold fs-1 mb-0">
            <FontAwesomeIcon icon={faImageUser} className="me-3 fs-2" />
            Live Portrait
          </h1>
          <p className="opacity-75 fw-medium" style={{ marginBottom: "3rem" }}>
            Use AI to transfer facial expressions, audio, and vocals from one
            face video to an image or video.
          </p>
          <div>
            <div className="row gx-0 gy-4">
              <div
                className="col-12 col-lg-3 d-flex gap-3 flex-column"
                // style={{ paddingTop: "4.2%" }}
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
                // style={{ paddingTop: "4.2%" }}
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
                      icon={isUserContent ? faSparkles : undefined}
                      label={
                        isUserContent
                          ? generatedVideoSrc
                            ? "Re-animate"
                            : "Animate"
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
                          onClick={handleDownloadClick}
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
              <div className="mt-5 pt-3 order-3">
                <Label label="Latest Outputs" />
                <div>
                  <SessionLpInferenceResultsList
                    sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                    onJobTokens={handleJobTokens}
                    addSourceToken={(newToken: string) =>
                      setSourceTokens(prevTokens =>
                        prevTokens.includes(newToken)
                          ? prevTokens
                          : [...prevTokens, newToken]
                      )
                    }
                    addMotionToken={(newToken: string) =>
                      setMotionTokens(prevTokens =>
                        prevTokens.includes(newToken)
                          ? prevTokens
                          : [...prevTokens, newToken]
                      )
                    }
                    onJobClick={handleJobClick}
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
