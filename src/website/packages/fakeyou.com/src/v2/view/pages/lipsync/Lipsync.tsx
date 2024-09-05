import React, { useCallback, useEffect, useRef, useState } from "react";
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
  faLips,
  faLock,
  faMicrophone,
  faPlus,
  faSparkles,
  faWaveformLines,
} from "@fortawesome/pro-solid-svg-icons";
import "../live_portrait/LivePortrait.scss";
import "./Lipsync.scss";
import {
  EnqueueLipsync,
  EnqueueLipsyncResponse,
  MediaFileCropArea,
} from "@storyteller/components/src/api/workflows/EnqueueLipsync";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { v4 as uuidv4 } from "uuid";
import { useInferenceJobs, useSession } from "hooks";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { AITools } from "components/marketing";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import LoadingSpinner from "components/common/LoadingSpinner";
import { GetMedia } from "@storyteller/components/src/api/media_files/GetMedia";
import { useLocation } from "react-router-dom";
import { LivePortraitDetails } from "@storyteller/components/src/api/model_inference/GetModelInferenceJobStatus";
import { useDocumentTitle } from "@storyteller/components/src/hooks/UseDocumentTitle";
import { useHistory } from "react-router-dom";
import { JobState } from "@storyteller/components/src/jobs/JobStates";
import PremiumLock from "components/PremiumLock";
import OutputThumbnailImage from "../live_portrait/OutputThumbnailImage";
import SessionLsInferenceResultsList from "./SessionLsInferenceResultsList";
import ThumbnailMediaPicker from "../live_portrait/ThumbnailMediaPicker";
import { GenerateTts } from "./GenerateTts";
import { GetWeight } from "@storyteller/components/src/api/weights/GetWeight";
import { LipsyncTokenMap } from "./LipsyncTokens";

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

interface CurrentlyGenerating {
  sourceIndex: number;
  motionIndex: number;
  jobState?: JobState;
}

interface JobProgress {
  [key: string]: number | null;
}

const PRECOMPUTED_SOURCE_TOKENS: string[] = [
  "m_2xrse9799wvy8hkv8tbxqxct8089t7", // Mona Lisa
];

export default function LivePortrait({
  sessionSubscriptionsWrapper,
}: LivePortraitProps) {
  useDocumentTitle("Lip Sync AI. Free Video Animation");
  const { enqueueInferenceJob } = useInferenceJobs();
  const { loggedIn, sessionFetched } = useSession();
  // const { open, close } = useModal();
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [selectedMotionIndex, setSelectedMotionIndex] = useState(0);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [visibility, setVisibility] = useState<"private" | "public">("public");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cropArea, setCropArea] = useState<MediaFileCropArea>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });
  const [voiceModelTitle, setVoiceModelTitle] = useState<string | null>(null);
  const [generatedVideoSrc, setGeneratedVideoSrc] = useState("");
  const [sourceTokens, setSourceTokens] = useState<string[]>([
    ...PRECOMPUTED_SOURCE_TOKENS,
  ]);
  const [audioTokens, setAudioTokens] = useState<string[]>([]);
  const numberOfInitialSourceTokensRef = useRef(sourceTokens.length);
  const numberOfInitialSourceTokens = numberOfInitialSourceTokensRef.current;
  const numberOfInitialAudioTokensRef = useRef(audioTokens.length);
  const numberOfInitialAudioTokens = numberOfInitialAudioTokensRef.current;
  const [userSourceToken, setUserSourceToken] = useState<string>("");
  const [userMotionToken, setUserMotionToken] = useState<string>("");
  const [isUserUploaded, setIsUserUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [jobProcessedTokens, setJobProcessedTokens] = useState<string[]>([]);
  const [currentlyGeneratingList, setCurrentlyGeneratingList] = useState<
    CurrentlyGenerating[]
  >([]);
  const [jobProgress, setJobProgress] = useState<JobProgress>({});
  const [currentCombinationKey, setCurrentCombinationKey] = useState("");
  const getCombinationKey = (sourceIndex: number, motionIndex: number) =>
    `s${sourceIndex}_m${motionIndex}`;
  const [voiceToken, setVoiceToken] = useState<string | null>(null);
  const [audioToken, setAudioToken] = useState<string | null>(null);
  const location = useLocation();
  const history = useHistory();

  const handleAudioResultToken = (token: string | null) => {
    setAudioToken(token);
  };

  const handleJobClick = (job: InferenceJob) => {
    const livePortraitDetails = job.maybeLivePortraitDetails;
    if (livePortraitDetails) {
      const { source_media_file_token, face_driver_media_file_token } =
        livePortraitDetails;

      const sourceIndex = sourceTokens.indexOf(source_media_file_token);
      const motionIndex = audioTokens.indexOf(face_driver_media_file_token);
      setSelectedSourceIndex(sourceIndex);
      setSelectedMotionIndex(motionIndex);
      setCurrentCombinationKey(getCombinationKey(sourceIndex, motionIndex));

      // Find the video for the clicked job
      const videoFromJob = generatedVideos.find(
        video => video.jobToken === job.jobToken
      );
      if (videoFromJob) {
        setGeneratedVideoSrc(videoFromJob.videoSrc);
        setIsGenerating(false);
      } else {
        // If there's no video and the job is still in the generating list, show progress
        const isGenerating = currentlyGeneratingList.some(
          gen =>
            gen.sourceIndex === sourceIndex && gen.motionIndex === motionIndex
        );
        if (isGenerating) {
          const progress =
            jobProgress[getCombinationKey(sourceIndex, motionIndex)] || 0;
          setJobProgress({
            ...jobProgress,
            [getCombinationKey(sourceIndex, motionIndex)]: progress,
          });
          setIsGenerating(true);
        } else {
          setIsGenerating(false);
          setGeneratedVideoSrc("");
        }
      }
    }
  };

  const handleJobStateChange = useCallback(
    (jobToken: string, jobState: JobState) => {
      const currentCombinationKey = getCombinationKey(
        selectedSourceIndex,
        selectedMotionIndex
      );

      if (jobState === JobState.COMPLETE_FAILURE) {
        setCurrentlyGeneratingList(prevList =>
          prevList.filter(
            gen =>
              !(
                gen.sourceIndex === selectedSourceIndex &&
                gen.motionIndex === selectedMotionIndex
              )
          )
        );

        setJobProgress(prevProgress => {
          const updatedProgress = { ...prevProgress };
          delete updatedProgress[currentCombinationKey];
          return updatedProgress;
        });

        setIsGenerating(false);
      }
    },
    [selectedSourceIndex, selectedMotionIndex]
  );

  const handleJobProgress = (progress: number | null) => {
    setJobProgress(prevProgress => ({
      ...prevProgress,
      [currentCombinationKey]: progress,
    }));
  };

  // const handleSourceSelect = (index: number) => {
  //   setIsUserUploaded(index >= numberOfInitialSourceTokens);
  //   setSelectedSourceIndex(index);
  //   setCurrentCombinationKey(getCombinationKey(index, selectedMotionIndex));
  // };

  // const handleMotionSelect = (index: number) => {
  //   setIsUserUploaded(index >= numberOfInitialAudioTokens);
  //   setSelectedMotionIndex(index);
  //   setCurrentCombinationKey(getCombinationKey(selectedSourceIndex, index));
  // };

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

    const combinationKey = getCombinationKey(
      selectedSourceIndex,
      selectedMotionIndex
    );
    setCurrentCombinationKey(combinationKey);

    EnqueueLipsync("", {
      creator_set_visibility: visibility,
      audio_media_file_token: "",
      maybe_crop: cropArea,
      remove_watermark: removeWatermark,
      image_or_video_media_file_token: "",
      uuid_idempotency_token: uuidv4(),
    }).then((res: EnqueueLipsyncResponse) => {
      if (res.success && res.inference_job_token) {
        enqueueInferenceJob(
          res.inference_job_token,
          FrontendInferenceJobType.Lipsync,
          false
        );
      } else {
        // @ts-ignore
        window.dataLayer.push({
          event: "enqueue_failure",
          page: "/live-portrait",
          user_id: "$user_id",
        });
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
    const isCurrentlyGenerating = currentlyGeneratingList.some(
      gen =>
        gen.sourceIndex === selectedSourceIndex &&
        gen.motionIndex === selectedMotionIndex
    );

    const currentProgress =
      jobProgress[
        getCombinationKey(selectedSourceIndex, selectedMotionIndex)
      ] || null;

    const latestVideoSrc = getLatestVideoForCombination(
      selectedSourceIndex,
      selectedMotionIndex
    );

    if (latestVideoSrc && !isCurrentlyGenerating) {
      return (
        <video
          loop
          autoPlay
          muted
          playsInline
          controls={true}
          preload="auto"
          key={latestVideoSrc}
        >
          <source src={latestVideoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (isCurrentlyGenerating) {
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
                {currentProgress !== null
                  ? `Generating video... ${currentProgress}%`
                  : "Generating video..."}
              </div>
            </h4>
          </div>
          <OutputThumbnailImage
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
            {audioToken ? (
              <h4 className="fw-medium">
                Click{" "}
                <b>
                  <FontAwesomeIcon icon={faSparkles} className="me-2 fs-6" />
                  Animate
                </b>{" "}
                to start generating
              </h4>
            ) : (
              <h4 className="fw-medium">
                <b>
                  <FontAwesomeIcon
                    icon={faWaveformLines}
                    className="me-2 fs-6"
                  />
                  Generate Audio
                </b>{" "}
                then click animate
              </h4>
            )}
          </div>
          <OutputThumbnailImage
            src={selectedSourceMediaLink || ""}
            alt="Preview"
            style={{ opacity: 0.15 }}
            draggable={false}
          />
        </div>
      );
    }
  };

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
      setAudioTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(userMotionToken);
        if (tokenIndex !== -1) {
          setSelectedMotionIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialAudioTokens);
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
  }, [userMotionToken, numberOfInitialAudioTokens]);

  const isUserContent =
    selectedSourceIndex >= numberOfInitialSourceTokens ||
    selectedMotionIndex >= numberOfInitialAudioTokens;

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
    if (!livePortraitDetails) {
      return;
    }

    // makes sure that it only processes each job once and exactly when needed
    if (jobProcessedTokens.includes(jobToken)) {
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
      const motionIndex = audioTokens.indexOf(
        livePortraitDetails.face_driver_media_file_token
      );

      const newGeneratedVideo = {
        sourceIndex,
        motionIndex,
        sourceToken: livePortraitDetails.source_media_file_token,
        motionToken: livePortraitDetails.face_driver_media_file_token,
        videoSrc: mediaLink,
        jobToken,
        createdAt,
      };

      setGeneratedVideos(prevGeneratedVideos => {
        return [
          ...prevGeneratedVideos.filter(v => v.jobToken !== jobToken),
          newGeneratedVideo,
        ];
      });

      // Set the video source from the clicked job, regardless of its timestamp relative to others
      if (
        selectedSourceIndex === newGeneratedVideo.sourceIndex &&
        selectedMotionIndex === newGeneratedVideo.motionIndex
      ) {
        setGeneratedVideoSrc(mediaLink);
        setIsGenerating(false);
      }

      setJobProcessedTokens(prevTokens => [...prevTokens, jobToken]);
    } else {
      console.error(
        "Failed to retrieve media or media has no public bucket path",
        response
      );
      setIsGenerating(false);
      setGeneratedVideoSrc("");
      setIsEnqueuing(false);
    }
  };

  const getLatestVideoForCombination = useCallback(
    (sourceIndex: number, motionIndex: number) => {
      const matchingVideos = generatedVideos.filter(
        video =>
          video.sourceIndex === sourceIndex && video.motionIndex === motionIndex
      );
      const sortedVideos = matchingVideos.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestVideo =
        sortedVideos.length > 0 ? sortedVideos[0].videoSrc : null;

      return latestVideo;
    },
    [generatedVideos]
  );

  useEffect(() => {
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
    getLatestVideoForCombination,
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
      setAudioTokens(prevTokens => {
        const tokenIndex = prevTokens.indexOf(motionToken);
        if (tokenIndex !== -1) {
          setSelectedMotionIndex(tokenIndex);
          setIsUserUploaded(tokenIndex >= numberOfInitialAudioTokens);
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
    numberOfInitialAudioTokens,
  ]);

  // const uploadFocusPointSource = useMemo(() => {
  //   const queryParams = new URLSearchParams(location.search);
  //   const sourceToken = queryParams.get("source");
  //   const motionToken = queryParams.get("motion");

  //   if (motionToken && !sourceToken) {
  //     return true;
  //   } else if (!motionToken && sourceToken) {
  //     return false;
  //   } else {
  //     return false;
  //   }
  // }, [location.search]);

  // const uploadFocusPointMotion = useMemo(() => {
  //   const queryParams = new URLSearchParams(location.search);
  //   const sourceToken = queryParams.get("source");
  //   const motionToken = queryParams.get("motion");

  //   if (sourceToken && !motionToken) {
  //     return true;
  //   } else if (!sourceToken && motionToken) {
  //     return false;
  //   } else {
  //     return false;
  //   }
  // }, [location.search]);

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

  useEffect(() => {
    if (generatedVideos.length > 0) {
      const relevantVideos = generatedVideos.filter(video =>
        currentlyGeneratingList.some(
          gen =>
            gen.sourceIndex === video.sourceIndex &&
            gen.motionIndex === video.motionIndex
        )
      );

      relevantVideos.forEach(video => {
        if (video.jobToken) {
          const jobIndex = currentlyGeneratingList.findIndex(
            gen =>
              gen.sourceIndex === video.sourceIndex &&
              gen.motionIndex === video.motionIndex
          );
          if (jobIndex !== -1) {
            const updatedGeneratingList = [...currentlyGeneratingList];
            updatedGeneratingList.splice(jobIndex, 1);
            setCurrentlyGeneratingList(updatedGeneratingList);

            const isCurrentJobGenerating = currentlyGeneratingList.some(
              gen =>
                gen.sourceIndex === selectedSourceIndex &&
                gen.motionIndex === selectedMotionIndex
            );

            if (!isCurrentJobGenerating) {
              setGeneratedVideoSrc(video.videoSrc);
              setIsGenerating(false);
            }
          }
        }
      });
    }
  }, [
    generatedVideos,
    currentlyGeneratingList,
    selectedSourceIndex,
    selectedMotionIndex,
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setVoiceToken(queryParams.get("voice"));

    if (voiceToken) {
      const precomputedSourceToken = LipsyncTokenMap[voiceToken];

      if (precomputedSourceToken) {
        // Set the precomputed source token as the media
        setSourceTokens(prevTokens => {
          const tokenIndex = prevTokens.indexOf(precomputedSourceToken);
          if (tokenIndex !== -1) {
            setSelectedSourceIndex(tokenIndex);
            setIsUserUploaded(tokenIndex >= numberOfInitialSourceTokens);
            return prevTokens;
          } else {
            const updatedTokens = [...prevTokens, precomputedSourceToken];
            setSelectedSourceIndex(updatedTokens.length - 1);
            setIsUserUploaded(true);
            return updatedTokens;
          }
        });
      }

      GetWeight(voiceToken, {})
        .then(response => {
          if (response && response.success) {
            const title = response.title || null;
            setVoiceModelTitle(title);
          } else {
            console.error(
              "Failed to retrieve media or media has no title",
              response
            );
          }
        })
        .catch(error => {
          console.error("Error fetching media:", error);
        });
    }
  }, [location.search, numberOfInitialSourceTokens, voiceToken]);

  const signupCTA = (
    <>
      {!sessionFetched ? null : (
        <div className="lp-signup-cta text-center">
          <FontAwesomeIcon icon={faLock} className="fs-3 mb-3" />
          <h4 className="mb-1 fw-bold">
            You need to be logged in to use Lip Sync
          </h4>
          <p className="mb-4 opacity-75">
            Please login or sign up to continue.
          </p>
          <div className="d-flex gap-2">
            <Button
              label="Login"
              variant="action"
              onClick={() => {
                history.push("/login?redirect=/ai-live-portrait");
              }}
            />
            <Button
              label="Sign up now"
              onClick={() => {
                history.push("/signup?redirect=/ai-live-portrait");
              }}
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Container type="panel" className="mt-3 mt-lg-5">
        <Panel padding={true}>
          <h1 className="fw-bold fs-1">
            <FontAwesomeIcon icon={faLips} className="me-3 fs-2" />
            Lip Sync
          </h1>

          <h2 className="fs-5 opacity-75 fw-semibold pb-2">
            Make your characters really speak with lip sync and text to speech
          </h2>

          {voiceModelTitle ? (
            <Panel
              style={{ marginBottom: "2.5rem" }}
              className="panel-inner p-3 rounded"
            >
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faMicrophone} className="me-1" />
                <h3 className="fs-6 fw-semibold mb-0">
                  {voiceModelTitle ? `Current Voice: ${voiceModelTitle}` : null}
                </h3>
              </div>
            </Panel>
          ) : null}
          {/* <hr style={{ marginBottom: "2.5rem" }} /> */}

          {!loggedIn && (
            <div style={{ marginBottom: "2.5rem" }}>{signupCTA}</div>
          )}

          <div>
            <div className="row gx-0 gy-4">
              <div className="col-12 col-lg-3 d-flex gap-3 flex-column align-items-center pt-lg-5">
                <ThumbnailMediaPicker
                  mediaTokens={sourceTokens}
                  selectedIndex={selectedSourceIndex}
                  title="Source Image/Video"
                  description="This is what your final video will look like."
                  badgeLabel="Source Media"
                  stepNumber={1}
                  onSelectedMediaChange={handleSelectedMediaChange}
                  showUploadButton={false}
                  showThumbnails={false}
                  stepAlwaysOnTop={true}
                />
              </div>

              <div className="col-12 col-lg-1 d-flex justify-content-center ls-section-between">
                <FontAwesomeIcon
                  icon={faPlus}
                  className="display-3 opacity-75"
                />
              </div>

              <div className="col-12 col-lg-3 d-flex gap-3 flex-column pt-lg-5">
                <GenerateTts
                  weightToken={voiceToken}
                  onResultToken={handleAudioResultToken}
                />
              </div>

              <div className="col-12 col-lg-1 d-flex justify-content-center ls-section-between">
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
                        !loggedIn && isUserContent
                          ? "Sign Up and Animate"
                          : isUserContent
                            ? generatedVideoSrc
                              ? "Re-animate"
                              : "Animate"
                            : !loggedIn
                              ? "Sign up now to Animate"
                              : "Upload your media to generate"
                      }
                      onClick={
                        loggedIn
                          ? enqueueClick
                          : () => history.push("/signup?redirect=/lipsync")
                      }
                      className="flex-grow-1"
                      // disabled={!isUserContent}
                      isLoading={isEnqueuing || isGenerating}
                      disabled={(!isUserContent && loggedIn) || !audioToken}
                    />
                    <Tippy theme="fakeyou" content="Download video">
                      <div>
                        <Button
                          square={true}
                          icon={faArrowDownToLine}
                          variant="action"
                          onClick={handleDownloadClick}
                          disabled={!loggedIn}
                        />
                      </div>
                    </Tippy>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-4">
                    <PremiumLock
                      sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                      lockPosition="top"
                      requiredPlan="pro"
                      plural={true}
                    >
                      <div className="d-flex gap-3">
                        <Checkbox
                          label={"Make Private"}
                          onChange={() => {
                            setVisibility(prevVisibility =>
                              prevVisibility === "private"
                                ? "public"
                                : "private"
                            );
                          }}
                          checked={visibility === "private"}
                          className="mb-0"
                        />

                        <Checkbox
                          label={"Remove Watermark"}
                          onChange={() => {
                            setRemoveWatermark(
                              prevRemoveWatermark => !prevRemoveWatermark
                            );
                          }}
                          checked={removeWatermark}
                          className="mb-0"
                        />
                      </div>
                    </PremiumLock>

                    {/* {!hasPremium && ( 
                      <div className="d-flex">
                        <Button
                          variant="link"
                          label="Upgrade to Premium to use features above"
                          icon={faStars}
                          to="/pricing"
                        />
                      </div>
                    )} */}
                  </div>
                </div>
              </div>

              {loggedIn && (
                <div className="mt-5 pt-3 order-3 d-none">
                  <Label label="Latest Outputs" />
                  <div>
                    <SessionLsInferenceResultsList
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
                        setAudioTokens(prevTokens =>
                          prevTokens.includes(newToken)
                            ? prevTokens
                            : [...prevTokens, newToken]
                        )
                      }
                      onJobClick={handleJobClick}
                      onJobProgress={handleJobProgress}
                      onJobStateChange={handleJobStateChange}
                    />
                  </div>
                </div>
              )}
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
