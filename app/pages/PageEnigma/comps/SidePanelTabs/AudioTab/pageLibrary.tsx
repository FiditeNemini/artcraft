import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useComputed } from "@preact/signals-react/runtime";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import { AssetFilterOption, FrontendInferenceJobType } from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";

import { Button } from "~/components";
import { AudioItemElements } from "./audioItemElements";
import { AudioTabPages } from "./types";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { InferenceElement } from "./inferenceElement";


export const PageLibrary = ({
  changePage,
}: {
  changePage: (newPage: AudioTabPages) => void;
}) => {
  const allAudioItems = useComputed(()=>[
    ...audioItems.value,
    ...audioItemsFromServer.value
  ]);
  const audioInferenceJobs = useComputed(()=>
    inferenceJobs.value.filter((job)=>{
      if( job.job_status !== JobState.COMPLETE_SUCCESS
        && (
          job.job_type === FrontendInferenceJobType.TextToSpeech
          || job.job_type === FrontendInferenceJobType.VoiceConversion
        )
      ){
        return job;
      }
    })
  );

  return (
    <>
      <div className="w-full overflow-x-auto px-4">
        <TabTitle title="Audio" />
        <div className="mb-4 flex items-center justify-start gap-2">
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
            disabled={!allAudioItems.value.some((item) => item.isMine)}>
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
            disabled={!allAudioItems.value.some((item) => item.isBookmarked)}>
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
          onClick={() => changePage(AudioTabPages.TTS)}>
          Generate Audio
        </Button>
      </div>

      <div className="mt-4 h-full w-full overflow-y-auto px-4">
        {audioInferenceJobs.value.length > 0 &&
          <div className="grid grid-cols-1 gap-2 mb-4">
            {audioInferenceJobs.value.map((job)=>{
              return(<InferenceElement key={job.job_id} job={job}/>);
            })}
          </div>
        }
        <AudioItemElements
          items={allAudioItems.value}
          assetFilter={audioFilter.value}
        />
      </div>
    </>
  );
};
