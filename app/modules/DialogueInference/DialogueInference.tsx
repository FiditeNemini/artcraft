import { useSignals } from "@preact/signals-react/runtime";
import { faClipboard, faClipboardList } from "@fortawesome/pro-solid-svg-icons";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { ButtonDialogue } from "../ButtonDialogue";
import { H4, P } from "~/components";


export const DialogueInference = () =>{
  useSignals();

  const buttonIcon = inferenceJobs.value.length > 0 
    ? faClipboardList : faClipboard;
  return(
    <ButtonDialogue
      title="My Jobs"
      buttonProps={{
        icon: buttonIcon,
        variant: "secondary",
        label: "My Jobs"
      }}
    >
      <H4>List :-</H4>
      {inferenceJobs.value.length > 0 &&
        <ul>
          {inferenceJobs.value.map(job=>
            <li key={job.job_id}>{job.job_type}: {job.job_status} : {job.job_id}</li>
          )}
        </ul>
      }
      {
        inferenceJobs.value.length === 0 && 
        <P>no inference jobs</P>
      }
    </ButtonDialogue>
  );
}

