import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/pro-solid-svg-icons";
import { ActiveJob, JobState } from "~/pages/PageEnigma/models";
import { useCallback } from "react";
import { STORAGE_KEYS } from "~/contexts/Authentication/types";
import { environmentVariables } from "~/store";

interface Props {
  movie: ActiveJob;
}

function getPercent(status: string) {
  if (status === "started") {
    return 20;
  }
  if (status === "waiting_to_start") {
    return 0;
  }
  if (status === "attempt_failed") {
    return 0;
  }
  return 100;
}

export function InProgressCard({ movie }: Props) {
  const completePercent = getPercent(movie.status.status);
  const completeLength = (600 * completePercent) / 100;

  const deleteJob = useCallback(() => {
    const endpoint = `${environmentVariables.value.BASE_API}/v1/jobs/job/${movie.job_token}`;
    const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN) || "";

    fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        session: sessionToken,
      },
    }).catch(() => {
      return {
        success: false,
        error_reason: "Unknown error",
      };
    });
  }, [movie]);

  return (
    <div className="mb-2 flex gap-2">
      <div className="my-2 ml-5 flex h-[70px] w-[124px] items-center justify-center rounded-lg bg-white/10">
        {movie.status.status === JobState.STARTED && (
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div>{movie.request.maybe_model_title}</div>
        <div className="bg-progressBar-unfinished relative block h-2 w-[600px]">
          <div
            className="bg-progressBar-finished absolute inset-0 block h-2"
            style={{ width: completeLength }}
          />
        </div>
        <div className="capitalize text-white/60">
          {movie.status.status.replaceAll("_", " ")}... {completePercent}%
        </div>
      </div>
      {movie.status.status !== JobState.STARTED && (
        <button onClick={deleteJob} className="ml-8">
          <FontAwesomeIcon icon={faClose} className="text-2xl text-white/50" />
        </button>
      )}
    </div>
  );
}
