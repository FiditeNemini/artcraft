import { twMerge } from "tailwind-merge";
import { faSpinnerThird, faCircleXmark, faXmark } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";
import { InferenceJob } from "~/pages/PageEnigma/models";
import { ButtonIcon, H5 } from "~/components";

export const InterenceElement = ({job}:{job:InferenceJob})=>{

  const className = twMerge(
    "rounded-md w-full flex justify-between items-center p-2 gap-2",
    job.job_status === JobState.PENDING ? "bg-inference-pending" : "",
    job.job_status === JobState.STARTED ? "bg-inference-generating" : "",
    job.job_status === JobState.DEAD ? "bg-inference-error" : ""
  );

  const statusText = "".concat(
    job.job_status === JobState.PENDING ? "Pending..." : "",
    job.job_status === JobState.STARTED ? "Generating..." : "",
    job.job_status === JobState.DEAD ? "Error" : ""
  )
  return(
    <div className={className}>
      {job.job_status  === JobState.DEAD &&
        <FontAwesomeIcon icon={faCircleXmark} />
      }
      {job.job_status !== JobState.DEAD &&
        <FontAwesomeIcon icon={faSpinnerThird} spin/>
      }
      <H5 className="grow">{statusText}</H5>
      {job.job_status === JobState.DEAD && 
        <ButtonIcon 
          icon={faXmark}
          onClick={()=>{
            console.log(job)
          }}
      />}
    </div>
  );
}