import React, { useCallback, useEffect, useState }  from 'react';
import { Link } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { GetLeaderboard, GetLeaderboardIsErr, GetLeaderboardIsOk, Leaderboard, LeaderboardEntryForList, LeaderboardLookupError } from '../../api/misc/GetLeaderboard';
import { GravatarFc } from '../_common/GravatarFc';

interface Props {
  sessionWrapper: SessionWrapper,
}

function LeaderboardFc(props: Props) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard|undefined>(undefined);
  const [ttsLeaderboard, setTtsLeaderboard] = useState<Array<LeaderboardEntryForList>|undefined>(undefined);
  const [w2lLeaderboard, setW2lLeaderboard] = useState<Array<LeaderboardEntryForList>|undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);

  const getLeaderboard = useCallback(async () => {
    const leaderboardReponse = await GetLeaderboard();

    if (GetLeaderboardIsOk(leaderboardReponse)) {
      setLeaderboard(leaderboardReponse);
      setTtsLeaderboard(leaderboardReponse.tts_leaderboard);
      setW2lLeaderboard(leaderboardReponse.w2l_leaderboard);
    } else if (GetLeaderboardIsErr(leaderboardReponse)) {
      switch(leaderboardReponse) {
        // TODO: There's an issue with the queries not returning before the deadline.
        // I should add a Redis TTL cache to store the results and an async job to warm the cache.
        case LeaderboardLookupError.NotFound:
          if (retryCount < 3) {
            setTimeout(() => getLeaderboard(), 1000);
            setRetryCount(retryCount+1);
          }
          break;
      }
    }
  }, [retryCount]);

  useEffect(() => {
    getLeaderboard();
  }, [getLeaderboard]);

  if (!leaderboard) {
    return <div />;
  }

  let ttsRows : Array<JSX.Element> = [];

  if (ttsLeaderboard) {
    ttsLeaderboard.forEach(ttsEntry => {
      ttsRows.push(
        <tr>
          <td>
            <Link to={FrontendUrlConfig.userProfilePage(ttsEntry.display_name)}>
              <GravatarFc 
                size={12} 
                username={ttsEntry.display_name} 
                email_hash={ttsEntry.gravatar_hash} />
              &nbsp;
              {ttsEntry.display_name}
            </Link>
          </td>
          <td>{ttsEntry.uploaded_count}</td>
        </tr>
      )
    })
  }

  let w2lRows : Array<JSX.Element> = [];

  if (w2lLeaderboard) {
    w2lLeaderboard.forEach(w2lEntry => {
      w2lRows.push(
        <tr>
          <td>
            <Link to={FrontendUrlConfig.userProfilePage(w2lEntry.display_name)}>
              <GravatarFc 
                size={12} 
                username={w2lEntry.display_name} 
                email_hash={w2lEntry.gravatar_hash} />
              &nbsp;
              {w2lEntry.display_name}
            </Link>
          </td>
          <td>{w2lEntry.uploaded_count}</td>
        </tr>
      )
    })
  }

  return (
    <div>
      <h1 className="title is-1"> Leaderboard </h1>

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> TTS Models Uploaded </h4>
            </td>
          </tr>

          {ttsRows}

          <tr>
            <td colSpan={2}>
              <br />
              <h4 className="subtitle is-4"> W2L Templates Uploaded </h4>
            </td>
          </tr>

          {w2lRows}

        </tbody>
      </table>
    </div>
  )
}

export { LeaderboardFc }