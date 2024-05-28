import { useCallback } from "react";
import { useSignalEffect, useSignals } from "@preact/signals-react/runtime";
import { GetUserMovies, instanceOfMediaListResponse } from "./utilities";
import { addToast, authentication, completedJobs } from "~/signals";

import {
  myMovies,
  setMyMovies,
  shouldPollMyMovies,
} from "~/pages/PageEnigma/signals";
import { ToastTypes } from "~/enums";

export const useBackgroundLoadingMedia = () => {
  useSignals();

  const PollMyMovies = useCallback(() => {
    // console.log("polling my movies");
    if (authentication.userInfo.value?.username) {
      GetUserMovies(authentication.userInfo.value.username).then((res) => {
        // console.log("GetUerMovies has response:", res);
        if (instanceOfMediaListResponse(res)) {
          setMyMovies(res.results);
        } else {
          addToast(ToastTypes.ERROR, res.error_reason);
        }
      });
    }
  }, []);

  useSignalEffect(() => {
    if (shouldPollMyMovies.value) {
      // shouldPollMyMovies is initiated as true to guaruntee first pull on load
      PollMyMovies();
    }
  });

  useSignalEffect(() => {
    //CASE 1: first load
    // if myMovies undefined, first load is not done
    if (!myMovies.value) {
      // turn on polling if it is not already on
      if (!shouldPollMyMovies.value) {
        shouldPollMyMovies.value = true;
      }
      return;
    }

    //CASE 2: pull after jobs completion
    if (!completedJobs.value || completedJobs.value.length === 0) {
      return; // nothing to do if there's no complete jobs
    }

    const workflowJobsTokens = completedJobs.value
      .filter((job) => {
        if (
          job.request.inference_category === "workflow" &&
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

    const myMoviesTokens = myMovies.value.map((movie) => movie.token);
    const isEveryTokenIncludedInPolled = workflowJobsTokens.every((token) =>
      myMoviesTokens.includes(token),
    );
    if (!isEveryTokenIncludedInPolled) {
      //there are videos newly completed, poll
      shouldPollMyMovies.value = true;
      return;
    }

    // at this point, make sure we stop polling because:
    // - myMovies first load is done
    // - completed jobs that contain new videos are all polled
    if (shouldPollMyMovies.value) {
      shouldPollMyMovies.value = false;
    }
  });
};
