import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ApiConfig } from '@storyteller/components';
import { TtsInferenceJob } from '@storyteller/components/src/jobs/TtsInferenceJobs';
import { GetTtsInferenceJobStatus, GetTtsInferenceJobStatusIsError, GetTtsInferenceJobStatusIsOk, GetTtsInferenceJobStatusSuccessResponse } from '@storyteller/components/src/api/jobs/GetTtsInferenceJobStatus';
import { jobStateCanChange } from '@storyteller/components/src/jobs/JobStates';

function ObsLayerPage() {
  const { username } : { username : string } = useParams();

  const [pendingTtsJobs, setPendingTtsJobs] = useState<TtsInferenceJob[]>([])

  // TODO: Do I need to use useCallback on everything?

  const openWebsocket = useCallback(async (twitchUsername: string) => {
    const url = new ApiConfig().obsEventsWebsocket(twitchUsername);
    const sock = new WebSocket(url);

    sock.onopen = function (event: Event) {
      console.log('on open event', event);
      sock.send('on open message from browser');
    };

    sock.onmessage = function (event: MessageEvent) {
      console.log('on message event', event.data);
      const result = JSON.parse(event.data);

      if ('tts_job_tokens' in result) {
        let newJobs : TtsInferenceJob[] = [];
        result['tts_job_tokens'].forEach((jobToken : string) => {
          const newJob = new TtsInferenceJob(jobToken);
          newJobs = newJobs.concat(newJob);
        });
        setPendingTtsJobs(pendingTtsJobs.concat(newJobs));
      }
    }

    sock.onerror = function(event: Event) {
      console.log('on error event', event);
    }

    // NB: This has a direct bearing on how fast the backend responds.
    // Increasing the delay will slow down the flow of events.
    setInterval(() => {
      sock.send('ping');
    }, 1000);
  }, [pendingTtsJobs]);

  const processUpdatedJob = useCallback(async (job: GetTtsInferenceJobStatusSuccessResponse) => {
    let updatedJobs : TtsInferenceJob[] = [];
    pendingTtsJobs.forEach(existingJob => {
      if (existingJob.jobToken !== job.state!.job_token ||
          !jobStateCanChange(existingJob.jobState)) {
        updatedJobs.push(existingJob);
        return;
      }
      console.log('new or updated job', job.state.job_token);
      const updatedJob = TtsInferenceJob.fromResponse(job.state);
      if (!!updatedJob.maybePublicBucketWavAudioPath) {
        console.log('Final audio: ', updatedJob.maybePublicBucketWavAudioPath);
      }
      updatedJobs.push(updatedJob);
    });

    setPendingTtsJobs(updatedJobs);
  }, [pendingTtsJobs]);

  const checkTtsInferenceJob = useCallback(async (jobToken: string) => {
    const response = await GetTtsInferenceJobStatus(jobToken);
    if (GetTtsInferenceJobStatusIsOk(response)) {
      await processUpdatedJob(response as GetTtsInferenceJobStatusSuccessResponse)
    } else if (GetTtsInferenceJobStatusIsError(response))  {
      // TODO
    }
  }, [processUpdatedJob]);

  const pollJobs = useCallback(async () => {
    pendingTtsJobs.forEach(async job => {
      if (jobStateCanChange(job.jobState)) {
        await checkTtsInferenceJob(job.jobToken);
      }
    });
  }, [checkTtsInferenceJob, pendingTtsJobs]);

  useEffect(() => {
    openWebsocket(username);
    setInterval(() => { pollJobs() }, 1000);
  }, [username, openWebsocket, pollJobs]);

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Paste this page's URL into OBS
          </h1>
        </div>
      </section>
    </div>
  )
}

export { ObsLayerPage }