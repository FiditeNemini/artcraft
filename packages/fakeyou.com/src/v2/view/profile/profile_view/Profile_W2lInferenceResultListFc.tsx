import React, { useState, useEffect, useCallback } from "react";
import {
  ApiConfig,
  ListW2lInferenceResultsForUserArgs,
} from "@storyteller/components";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faArrowLeft,
  faArrowRight,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const Fade = require("react-reveal/Fade");

interface W2lInferenceResultListResponsePayload {
  success: boolean;
  results: Array<W2lInferenceResult>;
  cursor_next: string | null | undefined;
  cursor_previous: string | null | undefined;
}

interface W2lInferenceResult {
  w2l_result_token: string;
  maybe_w2l_template_token?: string;
  maybe_tts_inference_result_token?: string;

  template_type: string;
  template_title: string;

  maybe_creator_user_token?: string;
  maybe_creator_username?: string;
  maybe_creator_display_name?: string;

  maybe_creator_result_id: number | null;

  file_size_bytes: number;
  frame_width: number;
  frame_height: number;
  duration_millis: number;

  visibility: string;

  created_at: string;
  updated_at: string;
}

interface Props {
  username: string;
}

function ProfileW2lInferenceResultsListFc(props: Props) {
  const [w2lResults, setW2lResults] = useState<Array<W2lInferenceResult>>([]);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [previousCursor, setPreviousCursor] = useState<string | null>(null);

  const getPage = useCallback(
    (cursor: string | null, reverse: boolean) => {
      let args: ListW2lInferenceResultsForUserArgs = {
        username: props.username,
        limit: 5,
      };

      if (cursor !== null) {
        args.cursor = cursor;
        if (reverse) {
          args.cursor_is_reversed = true;
        }
      }

      const api = new ApiConfig();
      const endpointUrl = api.listW2lInferenceResultsForUser(args);

      fetch(endpointUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((res) => {
          const templatesResponse: W2lInferenceResultListResponsePayload = res;
          if (!templatesResponse.success) {
            return;
          }

          setW2lResults(templatesResponse.results);
          setNextCursor(templatesResponse.cursor_next || null);
          setPreviousCursor(templatesResponse.cursor_previous || null);
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

  w2lResults.slice(0, 5).forEach((result) => {
    const duration_seconds = result.duration_millis / 1000;
    const templateTitle =
      result.template_title.length < 5
        ? `Title: ${result.template_title}`
        : result.template_title;

    const inferenceLink = `/w2l/result/${result.w2l_result_token}`;
    const templateLink = `/w2l/${result.maybe_w2l_template_token}`;

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
      <tr key={result.w2l_result_token}>
        <td>{result.maybe_creator_result_id}</td>
        <td>{visibilityIcon}</td>
        <th>
          <Link to={inferenceLink}>
            <FontAwesomeIcon icon={faFilm} className="me-2" />
            Result
          </Link>
        </th>
        <th>
          <Link to={templateLink}>{templateTitle}</Link>
        </th>
        <td>(custom audio)</td>
        <td>{duration_seconds} s</td>
        <td>{relativeCreateTime}</td>
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
          <thead>
            <tr>
              <th>
                <abbr title="Number">#</abbr>
              </th>
              <th>
                <abbr title="Visibility">
                  <FontAwesomeIcon icon={faEye} />
                </abbr>
              </th>
              <th>
                <abbr title="Result View">Result Link</abbr>
              </th>
              <th className="table-mw">
                <abbr title="Template">Template</abbr>
              </th>
              <th>
                <abbr title="Source">Audio Source</abbr>
              </th>
              <th>
                <abbr title="Duration">Duration</abbr>
              </th>
              <th>
                <abbr title="Created">Creation Time</abbr>
              </th>
            </tr>
          </thead>
          <Fade cascade bottom duration="200" distance="10px">
            <tbody>{rows}</tbody>
          </Fade>
        </table>
      </div>

      <p className="text-center py-3">
        Note: Results marked public (<FontAwesomeIcon icon={faEye} />) are
        visible by anyone visiting your profile.
        {/*You can change this by editing results. You can also set a default preference for new results.*/}
      </p>

      <div className="justify-content-center d-flex gap-3">
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

export { ProfileW2lInferenceResultsListFc };
