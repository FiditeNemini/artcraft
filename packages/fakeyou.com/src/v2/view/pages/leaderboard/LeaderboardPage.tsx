import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { WebUrl } from "../../../../common/WebUrl";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import {
  GetLeaderboard,
  GetLeaderboardIsErr,
  GetLeaderboardIsOk,
  Leaderboard,
  LeaderboardEntryForList,
  LeaderboardLookupError,
} from "../../../api/misc/GetLeaderboard";
import { DiscordLink2 } from "@storyteller/components/src/elements/DiscordLink2";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";

interface Props {
  sessionWrapper: SessionWrapper;
}

function LeaderboardPage(props: Props) {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | undefined>(
    undefined
  );
  const [ttsLeaderboard, setTtsLeaderboard] = useState<
    Array<LeaderboardEntryForList> | undefined
  >(undefined);
  const [w2lLeaderboard, setW2lLeaderboard] = useState<
    Array<LeaderboardEntryForList> | undefined
  >(undefined);
  const [retryCount, setRetryCount] = useState(0);

  const getLeaderboard = useCallback(async () => {
    const leaderboardReponse = await GetLeaderboard();

    if (GetLeaderboardIsOk(leaderboardReponse)) {
      setLeaderboard(leaderboardReponse);
      setTtsLeaderboard(leaderboardReponse.tts_leaderboard);
      setW2lLeaderboard(leaderboardReponse.w2l_leaderboard);
    } else if (GetLeaderboardIsErr(leaderboardReponse)) {
      switch (leaderboardReponse) {
        // TODO: There's an issue with the queries not returning before the deadline.
        // I should add a Redis TTL cache to store the results and an async job to warm the cache.
        case LeaderboardLookupError.NotFound:
          if (retryCount < 3) {
            setTimeout(() => getLeaderboard(), 1000);
            setRetryCount(retryCount + 1);
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

  let ttsRows: Array<JSX.Element> = [];

  if (ttsLeaderboard) {
    ttsLeaderboard.forEach((ttsEntry) => {
      ttsRows.push(
        <tr>
          <td className="lb-name">
            <Link to={WebUrl.userProfilePage(ttsEntry.display_name)}>
              <Gravatar
                size={12}
                username={ttsEntry.display_name}
                email_hash={ttsEntry.gravatar_hash}
              />
              &nbsp;
              {ttsEntry.display_name}
            </Link>
          </td>
          <td>{ttsEntry.uploaded_count}</td>
        </tr>
      );
    });
  }

  let w2lRows: Array<JSX.Element> = [];

  if (w2lLeaderboard) {
    w2lLeaderboard.forEach((w2lEntry) => {
      w2lRows.push(
        <tr>
          <td className="lb-name">
            <Link to={WebUrl.userProfilePage(w2lEntry.display_name)}>
              <Gravatar
                size={12}
                username={w2lEntry.display_name}
                email_hash={w2lEntry.gravatar_hash}
              />
              &nbsp;
              {w2lEntry.display_name}
            </Link>
          </td>
          <td>{w2lEntry.uploaded_count}</td>
        </tr>
      );
    });
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1 className="display-5 fw-bold" variants={item}>
            Leaderboard
          </motion.h1>
          <motion.h3 className="mb-4" variants={item}>
            Our most frequent contributors!
          </motion.h3>
          <motion.p className="lead" variants={item}>
            Want to be on the leaderboard?{" "}
            <DiscordLink2>Join our Discord</DiscordLink2> and learn more!
          </motion.p>
        </div>
      </div>

      <motion.div className="container-panel pt-5 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">TTS Models Uploaded</h2>
          <div className="py-6">
            <table className="table">
              <tbody>{ttsRows}</tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">W2L Templates Uploaded</h2>
          <div className="py-6">
            <table className="table">
              <tbody>{w2lRows}</tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { LeaderboardPage };
