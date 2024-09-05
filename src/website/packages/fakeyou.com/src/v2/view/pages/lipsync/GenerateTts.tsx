import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  faPause,
  faPlay,
  faSquareQuote,
  faWaveformLines,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import {
  GenerateTtsAudio,
  GenerateTtsAudioErrorType,
  GenerateTtsAudioIsError,
  GenerateTtsAudioIsOk,
} from "@storyteller/components/src/api/tts/GenerateTtsAudio";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { Button, Panel, TextArea } from "components/common";
import { useInferenceJobs } from "hooks";
import LipsyncAudioPlayer from "./LipsyncAudioPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetMedia } from "@storyteller/components/src/api/media_files/GetMedia";

interface GenerateTtsProps {
  weightToken?: string | null;
  onResultToken?: (token: string | null) => void;
}

export const GenerateTts = ({
  weightToken,
  onResultToken,
}: GenerateTtsProps) => {
  const [textBuffer, setTextBuffer] = useState("");
  const [maybeTtsError, setMaybeTtsError] = useState<
    GenerateTtsAudioErrorType | undefined
  >(undefined);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [jobToken, setJobToken] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [voiceToken] = useState(
    weightToken || "weight_hz7g8f1j4psrsw2sv67e4y61q"
  );
  const [progress, setProgress] = useState(0);

  const { enqueueInferenceJob, inferenceJobs } = useInferenceJobs();

  const [transcript, setTranscript] = useState<string | null>(null);

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setTextBuffer(textValue);
  };

  const handleEnqueueTts = async (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    if (!textBuffer) {
      return false;
    }

    // Check if the text hasn't changed and the voice hasn't changed

    setIsAudioLoading(true);

    const modelToken = voiceToken;

    const request = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: modelToken,
      inference_text: textBuffer,
    };

    const response = await GenerateTtsAudio(request);

    if (GenerateTtsAudioIsOk(response)) {
      setMaybeTtsError(undefined);

      enqueueInferenceJob(
        response.inference_job_token,
        FrontendInferenceJobType.TextToSpeech
      );
      setJobToken(response.inference_job_token);
      setTranscript(textBuffer);
    } else if (GenerateTtsAudioIsError(response)) {
      setMaybeTtsError(response.error);
    }

    return false;
  };

  useEffect(() => {
    if (!jobToken) return;

    const fetch = async () => {
      const job = inferenceJobs.find(
        (job: InferenceJob) => job.jobToken === jobToken
      );

      if (job && job.progressPercentage) {
        setProgress(job.progressPercentage);
      }

      if (job && job.maybeResultToken) {
        const url = new URL(window.location.href);
        url.searchParams.set("audio", job.maybeResultToken);
        window.history.replaceState({}, "", url.toString());

        if (onResultToken) {
          onResultToken(job.maybeResultToken);
        }
      }

      if (job && job.maybeResultPublicBucketMediaPath) {
        const audioLink = new BucketConfig().getGcsUrl(
          job.maybeResultPublicBucketMediaPath
        );
        setCurrentAudioUrl(audioLink);
        setProgress(0);

        if (audioLink !== currentAudioUrl) {
          setIsAudioLoading(false);
          setIsPlaying(true);
        }
      }
    };

    fetch();
  }, [currentAudioUrl, jobToken, inferenceJobs, onResultToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const maybeResultToken = urlParams.get("audio");

    if (maybeResultToken) {
      const fetchMedia = async () => {
        try {
          const response = await GetMedia(maybeResultToken, {});
          if (
            response &&
            response.media_file &&
            response.media_file.public_bucket_path &&
            response.media_file.maybe_text_transcript
          ) {
            const audioLink = new BucketConfig().getGcsUrl(
              response.media_file.public_bucket_path
            );
            setCurrentAudioUrl(audioLink);
            setTranscript(response.media_file.maybe_text_transcript || "");
          } else {
            console.error(
              "Failed to retrieve media or media has no public bucket path",
              response
            );
          }
        } catch (error) {
          console.error("Error fetching media:", error);
        }
      };

      fetchMedia();
    }
  }, []);

  const handleAudioFinish = () => {
    setIsPlaying(false);
  };

  const handleClearAudio = () => {
    setCurrentAudioUrl(null);
    setJobToken(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("audio");
    window.history.replaceState({}, "", url.toString());

    if (onResultToken) {
      onResultToken(null);
    }
  };

  let maybeError = <></>;
  if (!!maybeTtsError) {
    let hasMessage = false;
    let message = <></>;
    switch (maybeTtsError) {
      case GenerateTtsAudioErrorType.TooManyRequests:
        hasMessage = true;
        message = (
          <>Too many requests! Please wait a few minutes then try again.</>
        );
        break;
      case GenerateTtsAudioErrorType.ServerError |
        GenerateTtsAudioErrorType.BadRequest |
        GenerateTtsAudioErrorType.NotFound:
        break;
    }

    if (hasMessage) {
      maybeError = (
        <div
          className="alert alert-primary alert-dismissible fade show mt-3"
          role="alert"
        >
          <button
            className="btn-close"
            onClick={() => setMaybeTtsError(undefined)}
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
          {message}
        </div>
      );
    }
  }

  return (
    <>
      <div>
        <div className="d-flex gap-2 align-items-center mb-1">
          <div className="lp-step">2</div>
          <h2 className="fs-5 mb-0 fw-semibold">Generate Audio</h2>
        </div>

        <p className="fw-medium fs-7 opacity-75">
          What do you want your character to say?
        </p>
      </div>

      <div className="ratio ratio-1x1">
        <div className="d-flex flex-column h-100">
          {currentAudioUrl ? (
            <Panel
              padding={true}
              className="panel-inner h-100 position-relative"
            >
              <div className="d-flex flex-column justify-content-center h-100">
                <div className="d-flex gap-3 align-items-center justify-content-center">
                  <Button
                    icon={isPlaying ? faPause : faPlay}
                    onClick={() => setIsPlaying(!isPlaying)}
                    isLoading={isAudioLoading}
                    square={true}
                    small={true}
                  />
                  <div className="w-100">
                    <LipsyncAudioPlayer
                      filename={currentAudioUrl || ""}
                      play={isPlaying}
                      onFinish={handleAudioFinish}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <h6 className="fw-bold">
                    <FontAwesomeIcon icon={faSquareQuote} className="me-2" />
                    Audio Transcript
                  </h6>
                  <p className="fs-7">{transcript}</p>
                </div>
              </div>
              <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                <button
                  onClick={handleClearAudio}
                  className="ls-remove-audio-btn"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </Panel>
          ) : (
            <>
              <TextArea
                placeholder={"Type what you want your character to say..."}
                value={textBuffer}
                onChange={handleChangeText}
                rows={4}
                resize={false}
                className="h-100"
                autoFocus={true}
                disabled={isAudioLoading}
              />
              {maybeError}
              <Button
                label={
                  isAudioLoading
                    ? `Generating Audio... ${
                        progress !== 0 ? progress + "%" : ""
                      }`
                    : "Generate audio"
                }
                variant="action"
                icon={faWaveformLines}
                onClick={handleEnqueueTts}
                disabled={textBuffer.length === 0}
                isLoading={isAudioLoading}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};
