import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { BackLink } from '../../_common/BackLink';
import { GetTtsInferenceStats, GetTtsInferenceStatsIsOk } from '../../../api/moderation/GetTtsInferenceStats';
import { GetW2lInferenceStats, GetW2lInferenceStatsIsOk } from '../../../api/moderation/GetW2lInferenceStats';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationJobStatsFc(props: Props) {
  const [ttsPendingJobCount, setTtsPendingJobCount] = useState<number>(-1);
  const [ttsSecondsSinceFirst, setTtsSecondsSinceFirst] = useState<number>(-1);
  const [w2lPendingJobCount, setW2lPendingJobCount] = useState<number>(-1);
  const [w2lSecondsSinceFirst, setW2lSecondsSinceFirst] = useState<number>(-1);

  const getTtsStats = useCallback(async () => {
    const response = await GetTtsInferenceStats();
    if (GetTtsInferenceStatsIsOk(response)) {
      setTtsPendingJobCount(response.pending_count);
      setTtsSecondsSinceFirst(response.seconds_since_first);
    }
  }, []);
  
  const getW2lStats = useCallback(async () => {
    const response = await GetW2lInferenceStats();
    if (GetW2lInferenceStatsIsOk(response)) {
      setW2lPendingJobCount(response.pending_count);
      setW2lSecondsSinceFirst(response.seconds_since_first);
    }
  }, []);

  const reloadStats = useCallback(async () => {
    getTtsStats();
    getW2lStats();
  }, [getTtsStats, getW2lStats]);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);


  if (ttsPendingJobCount === -1 && w2lPendingJobCount === -1) {
    return <div />
  }

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  let ttsWait = humanWaitTime(ttsSecondsSinceFirst);
  let w2lWait = humanWaitTime(w2lSecondsSinceFirst);

  return (
    <div>
      <h1 className="title is-1"> Job Stats </h1>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />

      <br />
      <br />
      
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th></th>
            <th>Pending jobs</th>
            <th>Wait time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              TTS Inference
            </th>
            <td>{ttsPendingJobCount} pending </td>
            <td>{ttsWait}</td>
          </tr>
          <tr>
            <th>
              W2L Inference
            </th>
            <td>{w2lPendingJobCount} pending </td>
            <td>{w2lWait}</td>
          </tr>
        </tbody>
      </table>

      <br />
      <button 
        className="button is-info is-large is-fullwidth"
        onClick={() => reloadStats()}
        >Reload</button>
    </div>
  )
}

function humanWaitTime(seconds: number) : string {
  if (seconds === -1) {
    return 'error';
  } else if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 60 * 60) {
    return `${seconds / 60} minutes`;
  } else {
    return `${seconds / (60 * 60)} hours`;
  }
}

export { ModerationJobStatsFc };
