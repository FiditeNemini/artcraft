import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GenerateTtsAudio, GenerateTtsAudioErrorType, GenerateTtsAudioIsError, GenerateTtsAudioIsOk } from '@storyteller/components/src/api/tts/GenerateTtsAudio';
//import { GetTtsInferenceJobStatus, GetTtsInferenceJobStatusIsOk, TtsInferenceJobStatus } from "@storyteller/components/src/api/jobs/GetTtsInferenceJobStatus";

import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { GetTtsInferenceJobStatus, GetTtsInferenceJobStatusIsOk, TtsInferenceJobStatus } from "@storyteller/components/src/api/jobs/GetTtsInferenceJobStatus";
import { JobState, jobStateCanChange, jobStateFromString } from "@storyteller/components/src/jobs/JobStates";
import { TtsInferenceJob, TtsInferenceJobStateResponsePayload } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { ApiConfig } from '@storyteller/components';
import { TtsResultsList } from './TtsResultsList'

const DEFAULT_MODEL_TOKEN = "TM:7wbtjphx8h8v"; 

// We're only going to allow a limited selection of voices.
const DEMO_VOICES_TOKEN_TO_NAME = new Map<string, string>([
  [DEFAULT_MODEL_TOKEN, "Super Mario (impersonator)"],
  ["TM:4jhmevqnrqp5", "Queen Elizabeth II"],
  ["TM:70nmn1mmqfw8", "Frank Sinatra"],
  ["TM:fehfre1gpzaq", "Richard Nixon"],
  ["TM:cpwrmn5kwh97", "Morgan Freeman"],
  ["TM:kpjg712nen1k", "Betty White"],
  ["TM:7ryawppwcnkv", "Stan Lee"],
]);

interface Props {
}

function TtsComponent(props: Props) {
  const [selectedModelToken, setSelectedModelToken] = useState(DEFAULT_MODEL_TOKEN);
  const [inferenceText, setInferenceText] = useState('');
  const [maybeTtsError, setMaybeTtsError] = useState<GenerateTtsAudioErrorType|undefined>(undefined);
  const [jobs, setJobs] = useState<TtsInferenceJob[]>([]);

  const ttsInferenceJobs = useRef<TtsInferenceJob[]>([]);

  const enqueueTtsJob = (jobToken: string) => {
    const newJob = new TtsInferenceJob(jobToken);
    const newJobs = ttsInferenceJobs.current.concat([newJob]);
    console.log('new jobs', newJobs);
    //setTtsInferenceJobs(newJobs);
    ttsInferenceJobs.current = newJobs;
  }

  const checkTtsJob = (jobToken: string) => {
    const endpointUrl = new ApiConfig().getTtsInferenceJobState(jobToken);

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const jobResponse : TtsInferenceJobStateResponsePayload = response;

      if (jobResponse === undefined || jobResponse.state === undefined) {
        return;
      }

      let updatedJobs : Array<TtsInferenceJob> = [];

      ttsInferenceJobs.current.forEach(existingJob => {
        if (existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)) {
          updatedJobs.push(existingJob);
          return;
        }

        let updatedJob = TtsInferenceJob.fromResponse(jobResponse.state!);
        updatedJobs.push(updatedJob);
      });
 
      ttsInferenceJobs.current = updatedJobs;
      //setTtsInferenceJobs(updatedJobs);
      setJobs(updatedJobs);
    })
    .catch(e => { /* Ignore. */ });
  }

  const pollJobs = () => {
    console.log('pollJob')
    ttsInferenceJobs.current.forEach(job => {
      if (jobStateCanChange(job.jobState)) {
        checkTtsJob(job.jobToken);
      }
    });
  }

  useEffect(() => {
    console.log('useEffect')
    setInterval(() => { pollJobs() }, 2000);
  }, [])

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => { 
    const textValue = (ev.target as HTMLTextAreaElement).value;
    setInferenceText(textValue);
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => { 
    ev.preventDefault();

    if (!selectedModelToken) {
      return false;
    }

    if (!inferenceText) {
      return false;
    }

    const request = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: selectedModelToken,
      inference_text: inferenceText,
    }

    const response = await GenerateTtsAudio(request)

    if (GenerateTtsAudioIsOk(response)) {
      setMaybeTtsError(undefined);
      enqueueTtsJob(response.inference_job_token);
    } else if (GenerateTtsAudioIsError(response)) {
      setMaybeTtsError(response.error);
    }

    return false;
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="main-form">
        <div className="field">
          <div className="control">
            <textarea 
              onChange={handleChangeText}
              className="textarea is-large" 
              value={inferenceText}
              placeholder="Type something fun..."></textarea>
          </div>
        </div>

        <div className="button-group">
          <div className="columns is-mobile">
            <div className="column has-text-centered">
              <button 
                className="button is-danger is-large" 
                disabled={false}>Generate</button>
            </div>
            <div className="column has-text-centered">
              <button 
                className="button is-danger is-light is-large" 
                onClick={() => {}}>Clear</button>
            </div>
          </div>
        </div>

      </form>

      <TtsResultsList ttsInferenceJobs={jobs} />
    </>
  )
}

export { TtsComponent }