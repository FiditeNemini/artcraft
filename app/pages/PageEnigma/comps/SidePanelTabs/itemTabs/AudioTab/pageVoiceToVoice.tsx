import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

import { V2VState } from "../../../../models/voice";
import { faChevronRight, faRightLeft } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EnqueueVoiceConversionRequest,
  EnqueueVoiceConversionResponse,
} from "./typesImported";
import { GenerateVoiceConversion } from "./utilities";
import { H4, H6, Button, Label, UploadAudioComponent } from "~/components";

import { AudioTabPages } from "~/pages/PageEnigma/enums";
import { startPollingActiveJobs } from "~/signals";

export const PageVoicetoVoice = ({
  changePage,
  v2vState,
  setV2VState,
}: {
  changePage: (newPage: AudioTabPages) => void;
  v2vState: V2VState;
  setV2VState: (newState: V2VState) => void;
}) => {
  const requestV2V = useCallback(() => {
    const modelToken = v2vState.voice ? v2vState.voice.token : undefined;
    if (modelToken && v2vState.inputFileToken) {
      const request: EnqueueVoiceConversionRequest = {
        uuid_idempotency_token: uuidv4(),
        voice_conversion_model_token: modelToken,
        source_media_upload_token: v2vState.inputFileToken,
      };

      GenerateVoiceConversion(request).then(
        (res: EnqueueVoiceConversionResponse) => {
          if (res && res.inference_job_token) {
            startPollingActiveJobs();
            changePage(AudioTabPages.LIBRARY);
          }
        },
      );
    }
  }, [v2vState, changePage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <Label>Select a Voice</Label>
        <button
          className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-brand-secondary p-3 text-start transition-all hover:bg-ui-controls-button/40"
          onClick={() => changePage(AudioTabPages.SELECT_V2V_MODEL)}
        >
          <span className="h-12 w-12 rounded-lg bg-ui-controls-button/100" />
          <div className="grow">
            {!v2vState.voice && <H4>None Selected</H4>}
            {v2vState.voice && (
              <>
                <H4>{v2vState.voice.title}</H4>
                <H6 className="text-white/70">
                  by {v2vState.voice.creator.display_name}
                </H6>
              </>
            )}
          </div>
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-xl opacity-60"
          />
        </button>
      </div>

      <div className="flex flex-col">
        <Label>Upload Audio</Label>
        <UploadAudioComponent
          file={v2vState.file}
          onFileStaged={(file: File) => {
            setV2VState({ ...v2vState, file: file });
          }}
          onClear={() => {
            setV2VState({ ...v2vState, file: undefined });
          }}
          onFileUploaded={(fileToken: string) => {
            setV2VState({
              ...v2vState,
              inputFileToken: fileToken,
            });
          }}
        />
      </div>
      {/* <div className="my-4 flex w-full gap-4 justify-between items-center">
        <span className="bg-brand-secondary grow h-1"/>
        <H4>OR</H4>
        <span className="bg-brand-secondary grow h-1"/>
      </div> */}
      {/* <Button
        className="h-11 w-full text-sm"
        variant="secondary"
        icon={faCircleDot}
        onClick={() => {
          console.log("Record Button is clicked");
        }}>
        Record Audio
      </Button> */}
      <Button
        className="w-full py-3 text-sm"
        variant="primary"
        disabled={!v2vState.voice || !v2vState.inputFileToken}
        icon={faRightLeft}
        onClick={requestV2V}
      >
        Convert
      </Button>
    </div>
  );
};
