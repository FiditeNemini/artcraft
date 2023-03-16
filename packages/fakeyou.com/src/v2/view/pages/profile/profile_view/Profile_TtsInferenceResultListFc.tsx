import React, { useState, useEffect, useCallback } from "react";
import {
  ApiConfig,
  ListTtsInferenceResultsForUserArgs,
} from "@storyteller/components";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { ProfileTtsAudioPlayer } from "../../../_common/ProfileTtsAudioPlayer";
import { TextExpander } from "../../../_common/TextExpander";

const Fade = require("react-reveal/Fade");

interface TtsInferenceResultListResponsePayload {
  success: boolean;
  results: Array<TtsInferenceResult>;
  cursor_next: string | null | undefined;
  cursor_previous: string | null | undefined;
}

interface TtsInferenceResult {
  tts_result_token: string;

  tts_model_token: string;
  tts_model_title: string;

  raw_inference_text: string;

  public_bucket_wav_audio_path: string;

  maybe_creator_user_token?: string;
  maybe_creator_username?: string;
  maybe_creator_display_name?: string;

  maybe_creator_result_id: number | null;

  file_size_bytes: number;
  duration_millis: number;

  visibility: string;

  created_at: string;
  updated_at: string;
}

interface Props {
  username: string;
}

function ProfileTtsInferenceResultsListFc(props: Props) {
  const [ttsResults, setTtsResults] = useState<Array<TtsInferenceResult>>([]);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);

  const getPage = useCallback(
    (cursor: string | null, reverse: boolean) => {
      let args: ListTtsInferenceResultsForUserArgs = {
        username: props.username,
        limit: 10,
      };

      if (cursor !== null) {
        args.cursor = cursor;
        if (reverse) {
          args.cursor_is_reversed = true;
        }
      }

      const api = new ApiConfig();
      const endpointUrl = api.listTtsInferenceResultsForUser(args);

      fetch(endpointUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((res) => {
          const modelsResponse: TtsInferenceResultListResponsePayload = res;
          if (!modelsResponse.success) {
            return;
          }

          setTtsResults(modelsResponse.results);
          setNextCursor(modelsResponse.cursor_next || null);
          setPreviousCursor(modelsResponse.cursor_previous || null);
        })
        .catch((e) => {});
    },
    [props.username]
  );

  useEffect(() => {
    getPage(null, false);
  }, [getPage, props.username]);

  const now = new Date();

  let rows: Array<JSX.Element> = [];

  ttsResults.slice(0, 10).forEach((result) => {
    const duration_seconds = result.duration_millis / 1000;
    const audioLink = new BucketConfig().getGcsUrl(
      result.public_bucket_wav_audio_path
    );
    const wavesurfer = <ProfileTtsAudioPlayer filename={audioLink} />;
    const inferenceLink = `/tts/result/${result.tts_result_token}`;
    const modelLink = `/tts/${result.tts_model_token}`;

    const text = (
      <TextExpander text={result.raw_inference_text} cutLength={250} />
    );

    const createTime = new Date(result.created_at);
    const relativeCreateTime = formatDistance(createTime, now, {
      addSuffix: true,
    });

    const visibilityIcon =
      result.visibility === "public" ? (
        <FontAwesomeIcon icon={faEye} />
      ) : (
        <FontAwesomeIcon icon={faEyeSlash} />
      );

    rows.push(
      <tr key={result.tts_result_token}>
        <td className="p-4 p-lg-4 overflow-fix">
          <div className="d-flex flex-column gap-4">
            <div>
              <div className="d-flex flex-column flex-lg-row mb-2 pb-1 gap-2 align-items-lg-center">
                <h5 className="mb-0 fw-medium">
                  <Link
                    to={modelLink}
                    className="fw-medium profile-model-title"
                  >
                    {result.tts_model_title}
                  </Link>
                </h5>
                <span className="opacity-50 d-none d-lg-block">—</span>
                <Link className="fw-medium fs-6" to={inferenceLink}>
                  View Details / Download
                </Link>
              </div>

              <p>{text}</p>
            </div>

            {wavesurfer}
            <div className="d-flex flex-column flex-lg-row gap-2 gap-lg-0">
              <p className="opacity-75">
                #{result.maybe_creator_result_id}
                <span className="px-2">·</span>
                {visibilityIcon}
                <span className="px-2">·</span>
                {duration_seconds} s<span className="px-2">·</span>
                {relativeCreateTime}
              </p>
            </div>
          </div>
        </td>
      </tr>
    );
  });

  // Disable if there is no "next" or "previous" cursor.
  // However, let the buttosn show up if there are no results (empty payload)
  // to get unstuck. Come up with a better fix for this.
  let prevDisabled = !previousCursor && rows.length !== 0;
  let nextDisabled = !nextCursor && rows.length !== 0;

  return (
    <div>
      <div className="table-responsive">
        <table className="table">
          <Fade cascade bottom duration="200" distance="10px">
            <tbody className="">{rows}</tbody>
          </Fade>
        </table>
      </div>

      <div className="justify-content-center d-flex gap-3 p-3 p-lg-4">
        <button
          className="btn btn-secondary w-100"
          onClick={() => getPage(previousCursor, true)}
          disabled={prevDisabled}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Get newer
        </button>
        <button
          className="btn btn-secondary w-100"
          onClick={() => getPage(nextCursor, false)}
          disabled={nextDisabled}
        >
          Get older
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </button>
      </div>
    </div>
  );
}

export { ProfileTtsInferenceResultsListFc };
