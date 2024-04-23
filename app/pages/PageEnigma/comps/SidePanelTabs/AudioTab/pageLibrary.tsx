import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useSignals } from "@preact/signals-react/runtime";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption } from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";

import { Button } from "~/components";
import { AudioItemElements } from "./audioItemElements";
import { AudioTabPages } from "./types";

export const PageLibrary = ({
  changePage 
}:{
  changePage: (newPage:AudioTabPages) => void
})=>{
  useSignals();
  const allAudioItems = [...audioItems.value, ...audioItemsFromServer.value];

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start items-center gap-2 px-4">
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
          onClick={()=>changePage(AudioTabPages.TTS)}
        >
          Generate Audio
        </Button>
      </div>

      <div className="h-full w-full overflow-y-auto px-4 pt-4">
        <AudioItemElements
          items={allAudioItems}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
}