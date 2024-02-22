import React, { useState } from "react";
import { faDeleteLeft, faPlay } from "@fortawesome/pro-solid-svg-icons";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  Panel,
  Button,
  TextArea,
  SelectionBubbles,
  Accordion,
} from "components/common";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { v4 as uuidv4 } from "uuid";
import {
  GenerateTtsAudio,
  GenerateTtsAudioErrorType,
  GenerateTtsAudioIsError,
  GenerateTtsAudioIsOk,
} from "@storyteller/components/src/api/tts/GenerateTtsAudio";
import { Analytics } from "common/Analytics";
import { Link } from "react-router-dom";
import { SessionTtsInferenceResultList } from "v2/view/_common/SessionTtsInferenceResultsList";

interface TtsInferencePanelProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  enqueueTtsJob: (jobToken: string) => void;
}

export default function LandingDemo({
  inferenceJobs,
  sessionSubscriptionsWrapper,
  ttsInferenceJobs,
  enqueueInferenceJob,
  enqueueTtsJob,
  inferenceJobsByCategory,
}: TtsInferencePanelProps) {
  const [textBuffer, setTextBuffer] = useState("");
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [maybeTtsError, setMaybeTtsError] = useState<
    GenerateTtsAudioErrorType | undefined
  >(undefined);
  const [isAudioLimitAlertVisible, setAudioLimitAlertVisible] = useState(false);

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setTextBuffer(textValue);
    setAudioLimitAlertVisible(textValue.length > 100);
  };

  const voiceModelTokenMap: { [key: string]: string } = {
    Spongebob: "weight_vrx7j407cxk45jenkrd769h9b",
    Trump: "trump_model_token",
    Messi: "messi_model_token",
    // Add more voice options and their modelTokens as needed
  };

  const [voiceToken, setVoiceToken] = useState(voiceModelTokenMap["Spongebob"]);

  const handleVoiceSelection = (selected: string) => {
    console.log(`Selected option: ${selected}`);
    setVoiceToken(voiceModelTokenMap[selected]);
  };

  const handleEnqueueTts = async (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    if (!textBuffer) {
      return false;
    }

    setIsEnqueuing(true);

    const modelToken = voiceToken;

    const request = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: modelToken,
      inference_text: textBuffer,
    };

    const response = await GenerateTtsAudio(request);

    Analytics.ttsGenerate(modelToken, textBuffer.length);

    if (GenerateTtsAudioIsOk(response)) {
      setMaybeTtsError(undefined);

      if (response.inference_job_token_type === "generic") {
        enqueueInferenceJob(
          response.inference_job_token,
          FrontendInferenceJobType.TextToSpeech
        );
      } else {
        enqueueTtsJob(response.inference_job_token);
      }
    } else if (GenerateTtsAudioIsError(response)) {
      setMaybeTtsError(response.error);
    }

    setIsEnqueuing(false);

    return false;
  };

  let maybeError = <></>;
  if (!!maybeTtsError) {
    let hasMessage = false;
    let message = <></>;
    switch (maybeTtsError) {
      case GenerateTtsAudioErrorType.TooManyRequests:
        hasMessage = true;
        message = <>Error: Too many requests. Please try again in a bit.</>;
        break;
      case GenerateTtsAudioErrorType.ServerError |
        GenerateTtsAudioErrorType.BadRequest |
        GenerateTtsAudioErrorType.NotFound:
        break;
    }

    if (hasMessage) {
      maybeError = (
        <div
          className="alert alert-primary alert-dismissible fade show m-0"
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

  let audioLimitAlert = <></>;
  if (
    isAudioLimitAlertVisible &&
    !sessionSubscriptionsWrapper.hasPaidFeatures()
  ) {
    audioLimitAlert = (
      <>
        <div className="alert alert-warning fs-7 mb-0">
          <span className="fw-semibold">
            <u>Note:</u> Non-premium is limited to 12 seconds of audio.{" "}
            <Link className="fw-semibold" to="/pricing">
              Upgrade now
            </Link>
            .
          </span>
        </div>
      </>
    );
  }

  const voiceOptions = Object.keys(voiceModelTokenMap);

  return (
    <Panel padding={true}>
      <form className="d-flex flex-column">
        <div>
          <div>
            <label className="sub-title flex-grow-1">Select a Voice</label>
          </div>
          <SelectionBubbles
            options={voiceOptions}
            onSelect={handleVoiceSelection}
          />
        </div>

        <div className="d-flex flex-column mt-3">
          <div>
            <label className="sub-title flex-grow-1">Your Text</label>
          </div>
          <TextArea
            placeholder="Enter the text you want the voice to say here..."
            value={textBuffer}
            onChange={handleChangeText}
            rows={4}
            resize={false}
          />
          {audioLimitAlert}
        </div>

        <div className="d-flex gap-3 align-items-center mt-4">
          <Button
            icon={faPlay}
            square={true}
            onClick={handleEnqueueTts}
            isLoading={isEnqueuing}
            disabled={textBuffer.length === 0}
          />
          <>Autoplaying audio player here</>
        </div>
      </form>

      {inferenceJobs[0] && (
        <div className="mt-4">
          <Accordion>
            <Accordion.Item title="Session TTS Results" defaultOpen={true}>
              <div className="p-3">
                <SessionTtsInferenceResultList
                  inferenceJobs={
                    inferenceJobsByCategory.get(
                      FrontendInferenceJobType.TextToSpeech
                    )!
                  }
                  ttsInferenceJobs={ttsInferenceJobs}
                  sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                />
              </div>
            </Accordion.Item>
          </Accordion>
          {maybeError}
        </div>
      )}
    </Panel>
  );
}
