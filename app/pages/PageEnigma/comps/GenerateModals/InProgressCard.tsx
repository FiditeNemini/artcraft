import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/pro-solid-svg-icons";

import { ToastTypes } from "~/enums";
import { addToast, environmentVariables } from "~/signals";

import { JobState } from "~/pages/PageEnigma/enums";
import { ActiveJob } from "~/pages/PageEnigma/models";

import { Tooltip } from "~/components";

interface Props {
  movie: ActiveJob;
}

function getPercent(status: JobState) {
  if (status === JobState.STARTED) {
    return 20;
  }
  if (status === JobState.PENDING) {
    return 0;
  }
  if (status === JobState.COMPLETE_FAILURE) {
    return 0;
  }
  return 100;
}

export function InProgressCard({ movie }: Props) {
  const completePercent = getPercent(movie.status.status as JobState);
  const completeLength = (600 * completePercent) / 100;

  const deleteJob = useCallback(() => {
    const endpoint = `${environmentVariables.value.BASE_API}/v1/jobs/job/${movie.job_token}`;

    fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then(() => {
        addToast(ToastTypes.SUCCESS, "File successfully deleted.");
      })
      .catch(() => {
        addToast(ToastTypes.ERROR, "Error deleting the file.");
      });
  }, [movie]);

  return (
    <button className="flex w-full items-center justify-between px-5 py-3 text-start transition-all duration-150">
      <div className="flex gap-4">
        <div className="flex aspect-video w-36 items-center justify-center rounded-lg bg-white/10">
          <div>
            {movie.status.status === JobState.STARTED && (
              <svg
                className="h-6 w-6 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="font-medium">
            {movie.request.maybe_model_title || "Untitled"}
          </div>
          <div className="relative block h-[6px] w-[560px] overflow-hidden rounded-lg bg-white/10">
            <div
              className="absolute inset-0 block h-[6px] rounded-lg bg-brand-primary"
              style={{ width: completeLength }}
            />
          </div>
          <div className="text-sm capitalize text-white/60">
            {movie.status.status.replaceAll("_", " ")}... {completePercent}%
          </div>
        </div>
      </div>

      {movie.status.status !== JobState.STARTED && (
        <div className="pr-5">
          <Tooltip content="Cancel" position="top">
            <button
              onClick={deleteJob}
              className="text-xl text-white/50 transition-all duration-150 hover:text-white/90"
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          </Tooltip>
        </div>
      )}
    </button>
  );
}
