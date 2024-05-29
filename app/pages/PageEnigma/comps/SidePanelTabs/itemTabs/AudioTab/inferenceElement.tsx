import { twMerge } from "tailwind-merge";
import {
  faSpinnerThird,
  faCircleXmark,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { JobStatus } from "~/enums";
import { Job } from "~/models";
import { ButtonIcon, H5 } from "~/components";

export const InferenceElement = ({ job }: { job: Job }) => {
  const className = twMerge(
    "rounded-md w-full flex justify-between items-center p-2 gap-2",
    job.status.status === JobStatus.PENDING ? "bg-inference-pending" : "",
    job.status.status === JobStatus.STARTED ? "bg-inference-generating" : "",
    job.status.status === JobStatus.DEAD ? "bg-inference-error" : "",
  );

  const statusText = "".concat(
    job.status.status === JobStatus.PENDING ? "Pending..." : "",
    job.status.status === JobStatus.STARTED ? "Generating..." : "",
    job.status.status === JobStatus.DEAD ? "Error" : "",
  );
  return (
    <div className={className}>
      {job.status.status === JobStatus.DEAD && (
        <FontAwesomeIcon icon={faCircleXmark} />
      )}
      {job.status.status !== JobStatus.DEAD && (
        <FontAwesomeIcon icon={faSpinnerThird} spin />
      )}
      <H5 className="grow">{statusText}</H5>
      {job.status.status === JobStatus.DEAD && (
        <ButtonIcon
          icon={faXmark}
          onClick={() => {
            console.log(job);
          }}
        />
      )}
    </div>
  );
};
