import { useCallback, useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";
import { faCirclePlus, faArrowsRotate } from "@fortawesome/pro-solid-svg-icons";

import { AppUiContext } from "~/contexts/AppUiContext";
import { AuthenticationContext } from "~/contexts/Authentication";
import { APPUI_ACTION_TYPES } from "~/reducers";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import {
  AssetFilterOption,
  MediaItem,
  AssetType,
} from "~/pages/PageEnigma/models";

import { Button, ButtonIcon } from "~/components";

import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { ListAudioByUser } from "./listAudioByUser";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

export const AudioTabComponent = () => {
  useSignals();
  const [state, setState] = useState({
    firstLoad: false,
    fetchingUserAudio: false,
  });
  const { authState } = useContext(AuthenticationContext);
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const handleOpenTtsDialogue = () => {
    dispatchAppUiState({
      type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS,
    });
  };
  const allAudioItems = [...audioItems.value, ...audioItemsFromServer.value];

  const handleListAudioByUser = useCallback((username: string) => {
    setState((curr) => ({ ...curr, fetchingUserAudio: true }));
    ListAudioByUser(username).then((res: any[]) => {
      setState((curr) => ({ ...curr, fetchingUserAudio: false }));
      audioItemsFromServer.value = res.map((item) => {
        const morphedItem: MediaItem = {
          version: 1,
          type: AssetType.AUDIO,
          media_id: item.token,
          object_uuid: item.token,
          name: item.maybe_title || item.origin.maybe_model.title,
          length: 25,
          thumbnail: "/resources/placeholders/audio_placeholder.png",
          isMine: true,
          // isBookmarked?: boolean;
        };
        return morphedItem;
      });
    });
  }, []);

  useEffect(() => {
    if (authState.userInfo) {
      if (
        state.firstLoad === false &&
        audioItemsFromServer.value.length === 0
      ) {
        handleListAudioByUser(authState.userInfo.username);
        setState((curr) => ({ ...curr, firstLoad: true }));
      }
    }
  }, [authState, state, handleListAudioByUser]);

  useSignalEffect(() => {
    // flagging first load is done
    if (state.firstLoad === false && audioItemsFromServer.value.length > 0) {
      setState((curr) => ({ ...curr, firstLoad: true }));
    }

    // when inference changes, check if there's a new audio to refresh for
    if (inferenceJobs.value.length > 0 && authState.userInfo) {
      const found = inferenceJobs.value.find((job) => {
        if (job.job_status === JobState.COMPLETE_SUCCESS) {
          console.log(job);

          const foundItemOfJob = audioItemsFromServer.value.find((item) => {
            return item.media_id === job.result.entity_token;
          });

          return foundItemOfJob !== undefined;
        }
      });
      if (found === undefined) {
        handleListAudioByUser(authState.userInfo.username);
      }
    }
  });

  return (
    <>
      <div className="w-full overflow-x-auto p-4">
        <TabTitle title="Audio" />
        <div className="mb-4 flex justify-start gap-2">
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}>
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
            disabled={!allAudioItems.some((item) => item.isMine)}>
            My Audios
          </button>
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!allAudioItems.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
          <ButtonIcon
            className={twMerge(
              "absolute right-0 mr-4",
              // state.fetchingUserAudio ? "animate-spin" : "",
            )}
            icon={faArrowsRotate}
            onClick={() => {
              if (authState.userInfo?.username) {
                handleListAudioByUser(authState.userInfo?.username);
              }
            }}
          />
        </div>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
          onClick={handleOpenTtsDialogue}>
          Generate Audio
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <ItemElements items={allAudioItems} assetFilter={audioFilter.value} />
      </div>
    </>
  );
};
