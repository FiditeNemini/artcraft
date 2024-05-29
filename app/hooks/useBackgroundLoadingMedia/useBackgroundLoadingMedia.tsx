import { useSignalEffect, useSignals } from "@preact/signals-react/runtime";
import { PollUserMovies, PollUserAudioItems } from "./utilities";

import { completedJobs, userMovies, userAudioItems } from "~/signals";

import { JobType } from "~/enums";

export const useBackgroundLoadingMedia = () => {
  useSignals();

  useSignalEffect(() => {
    //CASE 1: first load
    // if myMovies undefined, poll for the first time
    if (!userMovies.value) {
      PollUserMovies();
      return;
    }

    //CASE 2: pull after jobs completion
    if (!completedJobs.value || completedJobs.value.length === 0) {
      return; // nothing to do if there's no complete jobs
    }

    const workflowJobsTokens = completedJobs.value
      .filter((job) => {
        if (
          job.request.inference_category === JobType.VideoStyleTransfer &&
          job.maybe_result.entity_token
        ) {
          return true;
        }
        return false;
      })
      .map((job) => job.maybe_result.entity_token);

    if (workflowJobsTokens.length === 0) {
      //nothing to do if no complete jobs has workflows, which create videos
      return;
    }

    const userMoviesTokens = userMovies.value.map((movie) => movie.token);
    const isEveryTokenIncludedInPolled = workflowJobsTokens.every((token) =>
      userMoviesTokens.includes(token),
    );
    if (!isEveryTokenIncludedInPolled) {
      //there are videos newly completed, poll
      PollUserMovies();
      return;
    }

    //else, no new movies, no need to poll;
  });

  useSignalEffect(() => {
    //CASE 1: first load
    // if audioItems undefined, poll for the first time
    if (!userAudioItems.value) {
      PollUserAudioItems();
      return;
    }

    //CASE 2: pull after jobs completion
    if (!completedJobs.value || completedJobs.value.length === 0) {
      return; // nothing to do if there's no complete jobs
    }

    const audioJobsTokens = completedJobs.value
      .filter((job) => {
        if (
          (job.request.inference_category === JobType.TextToSpeech ||
            job.request.inference_category === JobType.VoiceConversion) &&
          job.maybe_result.entity_token
        ) {
          return true;
        }
        return false;
      })
      .map((job) => job.maybe_result.entity_token);

    if (audioJobsTokens.length === 0) {
      //nothing to do if no complete jobs involves audio
      return;
    }

    const userAudioItemsTokens = userAudioItems.value.map(
      (audio) => audio.media_id,
    );
    const isEveryTokenIncludedInPolled = audioJobsTokens.every((token) =>
      userAudioItemsTokens.includes(token),
    );
    if (!isEveryTokenIncludedInPolled) {
      //there are videos newly completed, poll
      PollUserAudioItems();
      return;
    }
    //else, no new movies, no need to poll;
  });
};
