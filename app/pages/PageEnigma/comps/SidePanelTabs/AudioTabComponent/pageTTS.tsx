import { useCallback, useEffect, useState } from "react";
import { useSignalEffect } from "@preact/signals-react/runtime";
import { v4 as uuidv4 } from "uuid";

import {
  faChevronLeft,
  faBrainCircuit,
  faVolumeHigh,
} from "@fortawesome/pro-solid-svg-icons";

import {
  Button,
  ButtonIcon,
  H2,
  Label,
  LoadingDotsTyping,
  ListSearchDropdown,
  Textarea,
} from "~/components";

import {
  TtsModelListItem,
  GenerateTtsAudioResponse,
} from "~/pages/PageEnigma/models/tts";

import { addInferenceJob, inferenceJobs } from "../../../store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import {
  ListTtsModels,
  GenerateTtsAudio,
  GetMediaFileByToken,
} from "./utilities";
import { AudioTabPages } from "./types";
import { AudioItemElement } from "./audioItemElement";
import { MediaItem, AssetType } from "~/pages/PageEnigma/models";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

type TtsState = {
  voice: TtsModelListItem | undefined;
  text: string;
  hasEnqueued: boolean;
  inferenceToken?: string;
  inferenceJobType?: string;
  hasTtsResult: boolean;
};
const initialState: TtsState = {
  voice: undefined,
  text: "",
  hasEnqueued: false,
  inferenceJobType: undefined,
  inferenceToken: undefined,
  hasTtsResult: false,
};

export const PageTTS = ({
  changePage,
  sessionToken,
}: {
  changePage: (newPage: AudioTabPages) => void;
  sessionToken: string;
}) => {
  const [ttsState, setTtsState] = useState<TtsState>(initialState);

  const [ttsResultFile, setTtsResultFile] = useState<MediaItem | undefined>();

  useSignalEffect(() => {
    console.log(inferenceJobs.value);
    if (ttsState.hasEnqueued && ttsState.inferenceToken) {
      const found = inferenceJobs.value.find(
        (job) => job.job_id === ttsState.inferenceToken,
      );
      console.log(`finding: ${ttsState.inferenceToken}`);
      console.log(found);
      if (found?.job_status === JobState.COMPLETE_SUCCESS) {
        setTtsState((curr) => ({
          ...curr,
          hasTtsResult: true,
        }));
        GetMediaFileByToken(found.result.entity_token, sessionToken).then(
          (res) => {
            console.log(res);
            const morphedItem: MediaItem = {
              version: 1,
              type: AssetType.AUDIO,
              media_id: res.media_file.token,
              object_uuid: res.media_file.token,
              name: ttsState.voice?.title || "",
              description: ttsState.text,
              publicBucketPath: res.media_file.public_bucket_path,
              length: 25,
              thumbnail: "/resources/placeholders/audio_placeholder.png",
              isMine: true,
              // isBookmarked?: boolean;
            };
            setTtsResultFile(morphedItem);
          },
        );
      }
    }
  });

  const [ttsModels, setTtsModels] = useState<Array<TtsModelListItem>>([]);

  const listModels = useCallback(async () => {
    const ttsModelsLoaded = ttsModels.length > 0;
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListTtsModels(sessionToken);
    if (models) {
      setTtsModels(models);
    }
  }, []);

  useEffect(() => {
    listModels();
  }, [listModels]);

  useEffect(() => {
    if (
      ttsState.hasEnqueued &&
      ttsState.inferenceToken &&
      ttsState.inferenceJobType
    ) {
      console.log(`tts has Enqueued`);
      addInferenceJob({
        version: 1,
        job_id: ttsState.inferenceToken,
        job_type: ttsState.inferenceJobType,
        job_status: JobState.PENDING,
      });
    }
  }, [ttsState]);

  const requestTts = useCallback(
    (sessionToken: string) => {
      const modelToken = ttsState.voice
        ? ttsState.voice.model_token
        : undefined;

      if (modelToken) {
        setTtsState((curr) => ({
          ...curr,
          hasEnqueued: true,
          inferenceToken: undefined,
          inferenceJobType: undefined,
          hasAudio: false,
          result: undefined,
        }));

        const request = {
          uuid_idempotency_token: uuidv4(),
          tts_model_token: modelToken,
          inference_text: ttsState.text,
        };

        GenerateTtsAudio(request, sessionToken).then(
          (res: GenerateTtsAudioResponse) => {
            if (res && res.inference_job_token) {
              setTtsState((curr) => ({
                ...curr,
                inferenceToken: res.inference_job_token,
                inferenceJobType: res.inference_job_token_type,
              }));
            }
          },
        );
      } else {
        console.log("no voice model selected");
      }
    },
    [ttsState],
  );

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTtsState((curr) => ({
      ...curr,
      text: e.target.value,
    }));
  };

  const handleOnSelect = (val: string) => {
    console.log(val);
    const voiceModel = ttsModels.find((item) => {
      if (item.title === val) return item;
    });
    setTtsState((curr) => ({
      ...curr,
      voice: voiceModel,
    }));
  };

  return (
    <div className="flex flex-col p-4">
      <TabTitle
        title="Generate TTS"
        onBack={() => changePage(AudioTabPages.LIBRARY)}
      />
      <Label className="mb-1">Select a Voice</Label>
      {ttsModels.length > 0 && (
        <ListSearchDropdown
          list={ttsModels}
          listDisplayKey="title"
          onSelect={handleOnSelect}
        />
      )}
      <div className="mt-4 flex w-full justify-between">
        <Label>What would you like to say?</Label>
        <div className="flex items-center gap-2"></div>
      </div>
      <Textarea
        placeholder="Enter what you want the voice to say here."
        value={ttsState.text}
        onChange={handleTextInput}
        rows={8}
      />
      <div className="mt-4 flex gap-2">
        <div className="h-auto w-full">
          {!ttsState.hasTtsResult && !ttsState.hasEnqueued && (
            <Button
              className="h-11 w-full text-sm"
              variant={ttsState.hasTtsResult ? "secondary" : "primary"}
              disabled={ttsState.text === ""}
              icon={faVolumeHigh}
              onClick={() => requestTts(sessionToken)}>
              Generate
            </Button>
          )}
          {!ttsState.hasTtsResult && ttsState.hasEnqueued && (
            <LoadingDotsTyping className="rounded-lg bg-brand-secondary-500" />
          )}
          {ttsResultFile && <AudioItemElement item={ttsResultFile} />}
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-2">
        {ttsState.hasEnqueued && (
          <Button
            className="h-11 w-full text-sm"
            type="button"
            disabled={!ttsState.hasTtsResult || ttsState.text === ""}
            onClick={() => requestTts(sessionToken)}
            icon={faVolumeHigh}>
            Generate Another
          </Button>
        )}
      </div>
    </div>
  );
};
