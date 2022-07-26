import React, { useState, useEffect } from "react";
import { ApiConfig } from "@storyteller/components";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { distance, duration } from "../../../../data/animation";

const Fade = require("react-reveal/Fade");

const PER_PAGE = 10;

interface TtsModelListResponsePayload {
  success: boolean;
  models: Array<TtsModel>;
}

interface TtsModel {
  model_token: string;
  tts_model_type: string;
  title: string;
  updatable_slug: string;
  // TODO: No need for "creator_*" fields. Remove them from backend.
  is_mod_disabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  username: string;
}

function ProfileTtsModelListFc(props: Props) {
  const [ttsModels, setTtsModels] = useState<Array<TtsModel>>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.listTtsModelsForUser(props.username);

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const modelsResponse: TtsModelListResponsePayload = res;
        if (!modelsResponse.success) {
          return;
        }

        setTtsModels(modelsResponse.models);
      })
      .catch((e) => {});
  }, [props.username]); // NB: Empty array dependency sets to run ONLY on mount

  const nextPage = () => {
    setCurrentPageIndex(currentPageIndex + 1);
  };

  const previousPage = () => {
    setCurrentPageIndex(Math.max(currentPageIndex - 1, 0));
  };

  const start = currentPageIndex * PER_PAGE;
  const end = start + PER_PAGE;
  const pageTtsModels = ttsModels.slice(start, end);

  const now = new Date();

  let rows: Array<JSX.Element> = [];

  pageTtsModels.forEach((model) => {
    const modelTitle =
      model.title.length < 5 ? `Model: ${model.title}` : model.title;

    const modelLink = `/tts/${model.model_token}`;

    const createTime = new Date(model.created_at);
    const relativeCreateTime = formatDistance(createTime, now, {
      addSuffix: true,
    });

    rows.push(
      <tr key={model.model_token}>
        <th>
          <Link to={modelLink}>{modelTitle}</Link>
        </th>
        <td>{relativeCreateTime}</td>
      </tr>
    );
  });

  const isLastButtonDisabled = currentPageIndex < 1;
  const isNextButtonDisabled = ttsModels.length === 0 || end > ttsModels.length;

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>
              <abbr title="Model Name">Model Name</abbr>
            </th>
            <th>
              <abbr title="Creation Date">Creation Time</abbr>
            </th>
          </tr>
        </thead>
        <Fade cascade bottom duration="200" distance="10px">
          <tbody>{rows}</tbody>
        </Fade>
      </table>
      <div className="d-flex w-100 gap-3 mt-4">
        <button
          className="btn btn-secondary w-100"
          disabled={isLastButtonDisabled}
          onClick={() => previousPage()}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
          <span>Last Page</span>
        </button>

        <button
          className="btn btn-secondary w-100"
          disabled={isNextButtonDisabled}
          onClick={() => nextPage()}
        >
          <span>Next Page</span>
          <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
        </button>
      </div>
    </div>
  );
}

export { ProfileTtsModelListFc };
