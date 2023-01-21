import React, { useState, useEffect, useCallback } from "react";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams, Link, useHistory } from "react-router-dom";
import { FrontendUrlConfig } from "../../../../../common/FrontendUrlConfig";
import { VisibleIconFc } from "../../../_icons/VisibleIcon";
import { HiddenIconFc } from "../../../_icons/HiddenIcon";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../../data/animation";

const DEFAULT_VISIBILITY = "public";

interface W2lInferenceResultResponsePayload {
  success: boolean;
  result: W2lInferenceResult;
}

interface W2lInferenceResult {
  w2l_result_token: string;

  w2l_model_token: string;
  w2l_model_title: string;

  raw_inference_text: string;

  maybe_creator_user_token?: string;
  maybe_creator_username?: string;
  maybe_creator_display_name?: string;
  maybe_creator_gravatar_hash?: string;

  maybe_model_creator_user_token?: string;
  maybe_model_creator_username?: string;
  maybe_model_creator_display_name?: string;
  maybe_model_creator_gravatar_hash?: string;

  public_bucket_wav_audio_path: string;
  public_bucket_spectrogram_path: string;

  creator_set_visibility?: string;

  file_size_bytes: number;
  duration_millis: number;
  created_at: string;
  updated_at: string;

  maybe_moderator_fields: W2lInferenceResultModeratorFields | null | undefined;
}

interface W2lInferenceResultModeratorFields {
  creator_ip_address: string;
  mod_deleted_at: string | undefined | null;
  user_deleted_at: string | undefined | null;
}

interface Props {
  sessionWrapper: SessionWrapper;
}

function W2lResultEditPage(props: Props) {
  let { token }: { token: string } = useParams();

  const history = useHistory();

  const [w2lInferenceResult, setW2lInferenceResult] = useState<
    W2lInferenceResult | undefined
  >(undefined);
  const [visibility, setVisibility] = useState<string>(DEFAULT_VISIBILITY);

  const getW2lResult = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2lInferenceResult(token);

    fetch(endpointUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        const modelsResponse: W2lInferenceResultResponsePayload = res;
        if (!modelsResponse.success) {
          return;
        }

        setW2lInferenceResult(modelsResponse.result);
        setVisibility(
          modelsResponse?.result?.creator_set_visibility || DEFAULT_VISIBILITY
        );
      })
      .catch((e) => {});
  }, []);

  useEffect(() => {
    getW2lResult(token);
  }, [token, getW2lResult]);

  const handleVisibilityChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    setVisibility((ev.target as HTMLSelectElement).value);
  };

  const resultLink = FrontendUrlConfig.w2lResultPage(token);

  const handleFormSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (!w2lInferenceResult) {
      return false;
    }

    const resultToken = w2lInferenceResult!.w2l_result_token;

    const api = new ApiConfig();
    const endpointUrl = api.editW2lInferenceResult(resultToken);

    const request = {
      creator_set_visibility: visibility || DEFAULT_VISIBILITY,
    };

    fetch(endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(request),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res === undefined || !res.success) {
          return; // Endpoint error?
        }

        history.push(resultLink);
      })
      .catch((e) => {});

    return false;
  };

  let isDisabled = !w2lInferenceResult;

  const visibilityIcon =
    visibility === "public" ? <VisibleIconFc /> : <HiddenIconFc />;

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pb-4 pt-5 px-md-4 px-lg-5 px-xl-3">
        <motion.h1 className="display-5 fw-bold" variants={item}>
          Edit Result Visibility
        </motion.h1>
        <motion.div className="pt-3" variants={item}>
          <Link to={resultLink}>&lt; Back to result </Link>
        </motion.div>
      </div>

      <motion.form onSubmit={handleFormSubmit} variants={panel}>
        <div className="container-panel pt-4 pb-5">
          <div className="panel p-3 py-4 p-lg-4">
            <fieldset disabled={isDisabled}>
              <div>
                <label className="sub-title">
                  Result Visibility&nbsp;{visibilityIcon}
                </label>
                <div className="form-group">
                  <select
                    name="creator_set_visibility"
                    onChange={handleVisibilityChange}
                    value={visibility}
                    className="form-control"
                  >
                    <option value="public">
                      Public (visible from your profile)
                    </option>
                    <option value="hidden">Unlisted (shareable URLs)</option>
                  </select>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <motion.div className="container pb-5" variants={item}>
          <button className="btn btn-primary w-100">Update</button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export { W2lResultEditPage };
