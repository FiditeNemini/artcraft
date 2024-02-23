import { useState } from "react";
import { GetQueues, GetQueuesResponse } from "@storyteller/components/src/api/stats/queues/GetQueues";
import { useInterval } from "hooks";

interface Props {
  value?: any;
}

const DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS = 15000;

export default function useQueueStats({ value }: Props) {
  const [queueStats, setQueueStats] = useState<GetQueuesResponse>({
    success: true,
    cache_time: new Date(0), // NB: Epoch is used for vector clock's initial state
    refresh_interval_millis: DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
    inference: {
      total_pending_job_count: 0,
      pending_job_count: 0,
      by_queue: {
        pending_face_animation_jobs: 0,
        pending_rvc_jobs: 0,
        pending_svc_jobs: 0,
        pending_tacotron2_jobs: 0,
        pending_voice_designer: 0,
        pending_stable_diffusion: 0,
      },
    },
    legacy_tts: {
      pending_job_count: 0,
    },
  });

  const interval = Math.max(
    DEFAULT_QUEUE_REFRESH_INTERVAL_MILLIS,
    queueStats.refresh_interval_millis
  );

  const onTick = () => {
    GetQueues("",{})
    .then((res: GetQueuesResponse) => {
      if (res.cache_time) {
        let cache_time = new Date(res.cache_time);

        if (cache_time.getTime() > queueStats.cache_time.getTime()) {
          setQueueStats({ ...res, cache_time });
        }
      }
    });
  };

  onTick();

  useInterval({ interval, onTick });

  return queueStats;
};