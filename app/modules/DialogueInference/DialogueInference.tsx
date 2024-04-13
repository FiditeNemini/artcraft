import { useSignals } from "@preact/signals-react/runtime";
import {
  faClipboard,
  faClipboardList,
  faCircleCheck,
  faCircleExclamation,
  faLoader,
  faSpinner,
  faSquareXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { deleteInferenceJob, inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { InferenceJob } from "~/pages/PageEnigma/models";

import { ButtonDialogue } from "../ButtonDialogue";
import { ButtonIcon, H4,H6,P } from "~/components";
import { JobState } from "~/hooks/useInferenceJobManager/useInferenceJobManager";

const printJobType = (jobType : string)=>{
  switch (jobType){
    case "generic":
      return "Text to Speech";
    default:
      return "Unknown";
  }
};

const printJobStatus = (jobStatus : string)=>{
  switch (jobStatus){
    case JobState.PENDING:
      return "Adding to the queue.";
    case JobState.STARTED:
      return "Processing, please wait...";
    case JobState.COMPLETE_SUCCESS:
      return "Completed! See Audio Panel for the result. file."
    default:
      return "Unknown Status";
  }
};

const JobStatusIcon = ({jobStatus} : {jobStatus:string})=>{
  switch (jobStatus){
    case JobState.PENDING:{
      return(
        <FontAwesomeIcon
          className="col-span-1 animate-spin"
          icon={faSpinner}
          size="2xl"
        />
      );
    }
    case JobState.STARTED:{
      return(
          <FontAwesomeIcon
          className="col-span-1 animate-spin"
          icon={faLoader}
          size="2xl"
        />
      );
    }
    case JobState.COMPLETE_SUCCESS:{
      return(
        <FontAwesomeIcon
          className="col-span-1"
          icon={faCircleCheck}
          size="2xl"
        />
      );
    }
    default:{
      return(
        <FontAwesomeIcon
          className="col-span-1"
          icon={faCircleExclamation}
          size="2xl"
        />
      );
    }
  }
};

const InferenceItem = ({job}:{job:InferenceJob}) => {
  return(
    <li
      className="grid grid-cols-12 gap-2 items-center bg-brand-secondary rounded-md py-2 px-4"
    >
      <JobStatusIcon jobStatus={job.job_status} />
      <div className="col-span-10 flex flex-col">
          <H4>{printJobType(job.job_type)}</H4>
          <H6>{printJobStatus(job.job_status)} </H6>
      </div>
      {job.job_status === JobState.COMPLETE_SUCCESS &&
        <div className="col-span-1 flex justify-end">
          <ButtonIcon
            icon={faSquareXmark}
            size="2xl"
            onClick={()=>{
              deleteInferenceJob(job);
            }}
          />
        </div>
      }
    </li>
  );
};

export const DialogueInference = () =>{
  useSignals();

  const buttonIcon = inferenceJobs.value.length > 0
    ? faClipboardList : faClipboard;
  return(
    <ButtonDialogue
      title="My Jobs"
      dialogProps={{
        className:"w-1/2 max-w-full"
      }}
      buttonProps={{
        icon: buttonIcon,
        variant: "secondary",
        label: "My Jobs",
        className:( inferenceJobs.value.length === 0 ? "invisible" : "visible")
      }}
    >
      {inferenceJobs.value.length > 0 &&
        <ul className="flex flex-col gap-2">
          {inferenceJobs.value.map(job=>
            <InferenceItem key={job.job_id} job={job} />
          )}
        </ul>
      }
      {
        inferenceJobs.value.length === 0 &&
        <P>You currently have no running proccesses.</P>
      }
    </ButtonDialogue>
  );
}

