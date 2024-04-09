import { useEffect, useState } from "react";

import { useSignals } from "@preact/signals-react/runtime";
import { faClipboard, faClipboardList } from "@fortawesome/pro-solid-svg-icons";
import { inferenceJobs } from "~/pages/PageEnigma/store/inferenceJobs";
import { ButtonDialogue } from "../ButtonDialogue";
import { H4, P } from "~/components";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { InferenceJob } from "~/pages/PageEnigma/models";


export const DialogueInference = () =>{
  useSignals();
  const [inferenceJobsState, setInferenceJobsState] = useState<InferenceJob[]>(inferenceJobs.value);

  const handleInferenceJobs = (data:any)=>{
    console.log('Dialogue Inference > useEffect >>>');
    console.log(data);
    console.log(inferenceJobs.value);
    setInferenceJobsState([...inferenceJobs.value]);
    console.log('<<< Dialogue Inference');
  }
  useEffect(()=>{
    Queue.subscribe(
      QueueNames.TO_INFERENCE,
      handleInferenceJobs,
    );

  },[]);

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
      {inferenceJobsState.length > 0 &&
        <ul>
          {inferenceJobsState.map(job=>
            <li key={job.job_id}>{job.jobt_type} : {job.job_id}</li>
          )}
        </ul>
      }
      {
        inferenceJobsState.length === 0 && 
        <P>no inference jobs</P>
      }
    </ButtonDialogue>
  );
}

