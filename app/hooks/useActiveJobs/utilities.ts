import { getRecentJobs } from "~/api";
import { ToastTypes } from "~/enums";
import { authentication, addToast, setJobs } from "~/signals";

export function PollRecentJobs() {
  console.log("Poll recent jobs");
  const endpoint = getRecentJobs;

  fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.jobs && res.jobs.length > 0) {
        setJobs(res.jobs);
        // just no jobs, not an error, do nothing
      }
    })
    .catch(() => {
      addToast(ToastTypes.ERROR, "Unknown Error in Getting Recent Jobs");
    });
}
