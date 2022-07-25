import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FrontendUrlConfig } from "../../../common/FrontendUrlConfig";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import {
  GetLeaderboard,
  GetLeaderboardIsErr,
  GetLeaderboardIsOk,
  Leaderboard,
  LeaderboardEntryForList,
  LeaderboardLookupError,
} from "../../api/misc/GetLeaderboard";
import { DiscordLink2 } from "@storyteller/components/src/elements/DiscordLink2";
import { distance, delay, duration } from "../../../data/animation";
import { USE_REFRESH } from "../../../Refresh";

const Fade = require("react-reveal/Fade");

interface Props {
  sessionWrapper: SessionWrapper;
}

function LeaderboardFc(props: Props) {
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
            <Link to={FrontendUrlConfig.userProfilePage(ttsEntry.display_name)}>
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
            <Link to={FrontendUrlConfig.userProfilePage(w2lEntry.display_name)}>
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

  if (!USE_REFRESH) {
    return (
      <div>
        <h1 className="title is-1"> Leaderboard </h1>
        <h1 className="subtitle is-3"> Our most frequent contributors! </h1>

        <p>
          Want to be on the leaderboard?{" "}
          <DiscordLink2>Join our Discord</DiscordLink2> and learn more!
        </p>

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
    );
  }

  return (
    <div>
      <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <Fade cascade bottom distance={distance} duration={duration}>
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold">Leaderboard</h1>
            <h3 className="mb-4">Our most frequent contributors!</h3>
            <p className="lead">
              Want to be on the leaderboard?{" "}
              <DiscordLink2>Join our Discord</DiscordLink2> and learn more!
            </p>
          </div>
        </Fade>
      </div>

      <Fade
        cascade
        bottom
        distance={distance}
        duration={duration}
        delay={delay}
      >
        <div className="container-panel pt-5 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">TTS Models Uploaded</h2>
            <div className="py-6">
              <table className="table">
                <tbody>{ttsRows}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">W2L Templates Uploaded</h2>
            <div className="py-6">
              <table className="table">
                <tbody>{w2lRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export { LeaderboardFc };
