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
  const [w2lPendingJobCount, setW2lPendingJobCount] = useState<number>(-1);

  const getTtsStats = useCallback(async () => {
    const response = await GetTtsInferenceStats();
    if (GetTtsInferenceStatsIsOk(response)) {
      setTtsPendingJobCount(response.pending_count);
    }
  }, []);
  
  const getW2lStats = useCallback(async () => {
    const response = await GetW2lInferenceStats();
    if (GetW2lInferenceStatsIsOk(response)) {
      setW2lPendingJobCount(response.pending_count);
    }
  }, []);


  useEffect(() => {
    getTtsStats();
    getW2lStats();
  }, [getTtsStats, getW2lStats]);


  if (ttsPendingJobCount === -1 && w2lPendingJobCount === -1) {
    return <div />
  }

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <h1 className="title is-1"> Job Stats </h1>

      <BackLink link={FrontendUrlConfig.moderationMain()} text="Back to moderation" />

      <br />
      <br />
      
      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <th>
              Pending TTS Inference Jobs
            </th>
            <td>{ttsPendingJobCount}</td>
          </tr>
          <tr>
            <th>
              Pending W2L Inference Jobs
            </th>
            <td>{w2lPendingJobCount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export { ModerationJobStatsFc };
