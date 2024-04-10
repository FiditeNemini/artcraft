import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useSignals, useSignalEffect } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import { AppUiContext } from "~/pages/PageEnigma/contexts/AppUiContext";
import { AuthenticationContext } from "~/contexts/Authentication";
import { APPUI_ACTION_TYPES } from "~/pages/PageEnigma/reducers";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";

import { Button } from "~/components";

import { MediaItem, AssetType } from "~/pages/PageEnigma/models";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { ListAudioByUser } from "./listAudioByUser";

export const AudioTabComponent = () => {
  useSignals();
  const [ state, setState ] = useState({
    firstLoad: false,
  });
  const { authState } = useContext(AuthenticationContext);
  const [, dispatchAppUiState] = useContext(AppUiContext);
  const handleOpenTtsDialogue = ()=>{
      dispatchAppUiState({
      type: APPUI_ACTION_TYPES.OPEN_DIALOGUE_TTS
    })
  }
  const allAudioItems = [...audioItems.value, ...audioItemsFromServer.value];

  useEffect(()=>{
    if ( authState.userInfo ){
      if(state.firstLoad === false && audioItemsFromServer.value.length === 0){
        ListAudioByUser(authState.userInfo.username).then((res:any[])=>{
          // console.log(res)
          audioItemsFromServer.value = res.map(item=>{
            const morphedItem:MediaItem = {
              version: 1,
              type: AssetType.AUDIO,
              media_id: item.token,
              object_uuid: item.token,
              name: item.maybe_title || item.origin.maybe_model.title,
              // length?: number;
              thumbnail: "resources/placeholders/audio_placeholder.png",
              isMine: true,
              // isBookmarked?: boolean;
            }
            return morphedItem;
          });
        });
      }
    }
  }, [authState, state]);

  useSignalEffect(()=>{
    if (state.firstLoad === false && audioItemsFromServer.value.length > 0){
      setState({firstLoad: true});
    }
  });

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              audioFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (audioFilter.value = AssetFilterOption.MINE)}
            disabled={!allAudioItems.some((item) => item.isMine)}
          >
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
            disabled={!allAudioItems.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
          onClick={handleOpenTtsDialogue}
        >
          Generate Audio
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <ItemElements
          items={allAudioItems}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
};
