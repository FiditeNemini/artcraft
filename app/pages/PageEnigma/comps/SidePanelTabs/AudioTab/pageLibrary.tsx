import { useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useSignals, useComputed } from "@preact/signals-react/runtime";
import { audioFilter, audioItems } from "~/pages/PageEnigma/store";
import {
  AssetFilterOption,
  InferenceJobType,
  JobState,
} from "~/pages/PageEnigma/models";
import { audioItemsFromServer } from "~/pages/PageEnigma/store/mediaFromServer";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";

import { Button, Pagination } from "~/components";
import { UploadAudioButtonDiagloue } from "~/components/UploadAudioButtonDialogue";
import { AudioItemElements } from "./audioItemElements";
import { AudioTabPages } from "./types";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { InferenceElement } from "./inferenceElement";

export const PageLibrary = ({
  changePage,
  reloadLibrary,
}: {
  changePage: (newPage: AudioTabPages) => void;
  reloadLibrary: ()=>void;
}) => {
  useSignals();
  const allAudioItems = useComputed(() => [
    ...audioItems.value,
    ...audioItemsFromServer.value,
  ]);
  const displayedItems = allAudioItems.value.filter((item) => {
    if (audioFilter.value === AssetFilterOption.ALL) {
      return true;
    }
    if (audioFilter.value === AssetFilterOption.MINE) {
      return item.isMine;
    }
    return item.isBookmarked;
  });
  const audioInferenceJobs = useComputed(() =>
    inferenceJobs.value.filter((job) => {
      if (
        job.job_status !== JobState.COMPLETE_SUCCESS &&
        (job.job_type === InferenceJobType.TextToSpeech ||
          job.job_type === InferenceJobType.VoiceConversion)
      ) {
        return job;
      }
    }),
  );
  const pageSize = 20;
  const totalPages = Math.ceil(allAudioItems.value.length / pageSize);
  const [currentPage, setCurrentPage] = useState<number>(0);

  return (
    <>
      <TabTitle title="Audio" />
      <div>
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden px-4">
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

      <div className="w-full px-4 flex gap-3">
        <UploadAudioButtonDiagloue onUploaded={reloadLibrary}/>
        <Button
          className="grow py-3 text-sm font-medium"
          icon={faCirclePlus}
          variant="action"
          onClick={() => changePage(AudioTabPages.GENERATE_AUDIO)}>
          Generate Audio
        </Button>
      </div>

      <div className="w-full grow overflow-y-auto px-4">
        {audioInferenceJobs.value.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2">
            {audioInferenceJobs.value.map((job) => {
              return <InferenceElement key={job.job_id} job={job} />;
            })}
          </div>
        )}
        <AudioItemElements
          currentPage={currentPage}
          pageSize={pageSize}
          items={displayedItems}
        />
      </div>
      {totalPages > 1 &&
        <Pagination
          className="-mt-4 px-4"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(newPage:number)=>{
            setCurrentPage(newPage);
          }}
        />
      }
      <span className="w-full"/>
    </>
  );
};
