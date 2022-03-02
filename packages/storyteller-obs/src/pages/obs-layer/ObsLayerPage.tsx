import React, { useCallback, useEffect, useRef, useState } from 'react';
//import WaveSurfer from 'wavesurfer.js';
import { ApiConfig } from '@storyteller/components';
import { BucketConfig } from '@storyteller/components/src/api/BucketConfig';
import { GetTtsInferenceJobStatus, GetTtsInferenceJobStatusIsError, GetTtsInferenceJobStatusIsOk, GetTtsInferenceJobStatusSuccessResponse } from '@storyteller/components/src/api/jobs/GetTtsInferenceJobStatus';
import { Howl } from 'howler';
import { TtsInferenceJob } from '@storyteller/components/src/jobs/TtsInferenceJobs';
import { jobStateCanChange } from '@storyteller/components/src/jobs/JobStates';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import WebSocketProtocol from './player/WebSocketProtocol';

/*
NB: Debugging with CORS and self signed certs in local dev is a nightmare. Use this (Linux):

    chromium-browser --disable-web-security --user-data-dir="~/chrome"

*/

function ObsLayerPage() {
  console.warn('>>> OBS <<<');

  const { username } : { username : string } = useParams();

  const [interfaceHidden, setInterfaceHidden]= useState(false);

  const webSocketProtocolRef = useRef<WebSocketProtocol>(new WebSocketProtocol(username));

  useEffect(() => {
    webSocketProtocolRef.current.start();
  }, [username]);

  /*
  const webSocketRef = useRef<WebSocket|undefined>(undefined);
  const pendingTtsJobsRef = useRef<TtsInferenceJob[]>([]);


  const openWebsocket = useCallback(async (twitchUsername: string) => {
    if (webSocketRef.current !== undefined) {
      return;
    }
    //if (webSocketRef.current === undefined) {
    //  //waveSurferInstance.current = WaveSurfer.create({
    //  //  container: '#waveform', // Previousy I used 'this.ref.current' and React.createRef()
    //  //  height: 200,
    //  //  responsive: true,
    //  //  waveColor: '#777',
    //  //  progressColor:  '#ccc',
    //  //  cursorColor: '#3273dc',
    //  //  cursorWidth: 2,
    //  //  normalize: false,
    //  //});
    //}
    console.warn('>>>>>>> CREATING WEB SOCKET <<<<<<<<');

    const url = new ApiConfig().obsEventsWebsocket(twitchUsername);
    
    console.log('websocket url: ', url);

    const sock = new WebSocket(url);

    document.documentElement.addEventListener("mousedown", () => {
      console.log('play dummy sound');
      let sound = new Howl({
        src: ['foo']
      });
      sound.play();
    })


    webSocketRef.current = sock;

    sock.onopen = function (event: Event) {
      console.log('on open event', event);
      sock.send('on open message from browser');
    };

    sock.onmessage = function (event: MessageEvent) {
      console.log('on message event', event.data);
      //sock.send('ack');

      const result = JSON.parse(event.data);

      if (result['response_type'] === 'TtsEvent') {
        if ('tts_job_tokens' in result) {
          let newJobs : TtsInferenceJob[] = [];
          result['tts_job_tokens'].forEach((jobToken : string) => {
            const newJob = new TtsInferenceJob(jobToken);
            newJobs = newJobs.concat(newJob);
          });
          pendingTtsJobsRef.current = pendingTtsJobsRef.current.concat(newJobs);
          //setPendingTtsJobs(pendingTtsJobs.concat(newJobs));
        }
      }

      return false; // TODO: Keeps socket alive?
    }

    sock.onerror = function(event: Event) {
      console.log('on error event', event);

      sock.close();
      openWebsocket(username);
    }

    let intervalHandle : number | undefined = undefined;

    // NB: This has a direct bearing on how fast the backend responds.
    // Increasing the delay will slow down the flow of events.
    intervalHandle = window.setInterval(() => {
      //console.log('sending ping');
      if (sock.readyState === sock.OPEN) {
        sock.send('ping');
      } else {
        console.warn('Socket is closed', sock.readyState, sock);

        sock.close();
        clearInterval(intervalHandle);

        openWebsocket(username);
      }
    }, 1000);
  }, [username]);

  const playAudio = async (job: TtsInferenceJob) => {
    const audioLink = new BucketConfig().getGcsUrl(job.maybePublicBucketWavAudioPath);

    console.log('playing audio url: ', audioLink);

    //if (waveSurferInstance.current === undefined) {
    //  return;
    //}

    //waveSurferInstance.current.load(audioLink)
    //waveSurferInstance.current.on('load')
    //waveSurferInstance.current.play();

    let sound = new Howl({
      src: [audioLink]
    });
    
    sound.play();
  }

  const processUpdatedJob = useCallback(async (job: GetTtsInferenceJobStatusSuccessResponse) => {
    let updatedJobs : TtsInferenceJob[] = [];
    pendingTtsJobsRef.current.forEach(existingJob => {
      if (existingJob.jobToken !== job.state!.job_token ||
          !jobStateCanChange(existingJob.jobState)) {
        // TODO: Prune permanently dead jobs.
        updatedJobs.push(existingJob);
        return;
      }
      console.log('new or updated job', job.state.job_token);
      const updatedJob = TtsInferenceJob.fromResponse(job.state);

      if (!!updatedJob.maybePublicBucketWavAudioPath) {
        console.log('done with job, playing audio...');
        playAudio(updatedJob);
      } else {
        updatedJobs.push(updatedJob);
      }
    });

    //setPendingTtsJobs(updatedJobs);
    pendingTtsJobsRef.current = updatedJobs;
  }, []);

  const checkTtsInferenceJob = useCallback(async (jobToken: string) => {
    const response = await GetTtsInferenceJobStatus(jobToken);
    if (GetTtsInferenceJobStatusIsOk(response)) {
      await processUpdatedJob(response as GetTtsInferenceJobStatusSuccessResponse)
    } else if (GetTtsInferenceJobStatusIsError(response))  {
      // TODO
    }
  }, [processUpdatedJob]);

  const pollJobs = useCallback(async () => {
    pendingTtsJobsRef.current.forEach(async job => {
      if (jobStateCanChange(job.jobState)) {
        await checkTtsInferenceJob(job.jobToken);
      }
    });
  }, [checkTtsInferenceJob]);

  useEffect(() => {
    openWebsocket(username);
    setInterval(() => { pollJobs() }, 1000);
  }, [username, openWebsocket, pollJobs]);

  */

  if (interfaceHidden) {
    return <></>;
  }

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Paste this page's URL into OBS
          </h1>
          <h1 className="subtitle is-5">Twitch Username : {username}</h1>
          <br />
          <button
            className="button is-info is-large is-fullwidth"
            onClick={() => setInterfaceHidden(true)}
            >
            <FontAwesomeIcon icon={faVolumeUp} />&nbsp;&nbsp;Click this to activate audio and hide UI 
          </button>
        </div>
      </section>
    </div>
  )
}

/*
  const openWebsocket = async (
    twitchUsername: string, 
    pendingTtsJobs: TtsInferenceJob[],
    setPendingTtsJobs: (jobs: TtsInferenceJob[]) => void
  ) => {
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

      return false; // TODO: Keeps socket alive?
    }

    sock.onerror = function(event: Event) {
      console.log('on error event', event);
    }

    // NB: This has a direct bearing on how fast the backend responds.
    // Increasing the delay will slow down the flow of events.
    setInterval(() => {
      sock.send('ping');
    }, 1000);
  };
*/

export { ObsLayerPage }