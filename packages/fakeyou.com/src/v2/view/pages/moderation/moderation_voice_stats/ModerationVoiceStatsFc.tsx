import React, { useCallback, useEffect, useState } from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { WebUrl } from '../../../../../common/WebUrl';
import { BackLink } from '../../../_common/BackLink';
import { GetVoiceInventoryStats, GetVoiceInventoryStatsIsOk } from '@storyteller/components/src/api/moderation/stats/GetVoiceInventoryStats';

interface Props {
  sessionWrapper: SessionWrapper,
}

function ModerationVoiceStatsFc(props: Props) {
  const [allVoicesCount, setAllVoicesCount] = useState<number>(-1);
  const [publicVoicesCount, setPublicVoicesCount] = useState<number>(-1);

  const getVoiceStats = useCallback(async () => {
    const response = await GetVoiceInventoryStats();
    if (GetVoiceInventoryStatsIsOk(response)) {
      setAllVoicesCount(response.all_voices_count_including_deleted);
      setPublicVoicesCount(response.public_voices_count);
    }
  }, []);
  
  const reloadStats = useCallback(async () => {
    getVoiceStats();
  }, [getVoiceStats]);

  useEffect(() => {
    reloadStats();
  }, [reloadStats]);


  if (allVoicesCount === -1 && publicVoicesCount === -1) {
    return <div />
  }

  if (!props.sessionWrapper.canEditOtherUsersTtsModels()) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <h1 className="title is-1"> Voice Stats </h1>

      <BackLink link={WebUrl.moderationMain()} text="Back to moderation" />

      <br />
      <br />
      
      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <th>
              Public voice vount
            </th>
            <td>{publicVoicesCount} voices </td>
          </tr>
          <tr>
            <th>
              All voice count (incl banned)
            </th>
            <td>{allVoicesCount} voices </td>
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

export { ModerationVoiceStatsFc };
