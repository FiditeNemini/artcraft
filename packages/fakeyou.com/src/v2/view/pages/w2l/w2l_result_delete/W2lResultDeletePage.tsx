import React, { useState, useEffect, useCallback } from "react";
import { ApiConfig } from "@storyteller/components";
import { WebUrl } from "../../../../../common/WebUrl";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams, Link, useHistory } from "react-router-dom";
import {
  GetW2lResult,
  GetW2lResultIsOk,
  W2lResult,
} from "../../../../api/w2l/GetW2lResult";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../../data/animation";

interface Props {
  sessionWrapper: SessionWrapper;
}

function W2lResultDeletePage(props: Props) {
  const history = useHistory();

  let { token } = useParams() as { token: string };

  const [w2lInferenceResult, setW2lInferenceResult] = useState<
    W2lResult | undefined
  >(undefined);

  const getInferenceResult = useCallback(async (token) => {
    const templateResponse = await GetW2lResult(token);
    if (GetW2lResultIsOk(templateResponse)) {
      setW2lInferenceResult(templateResponse);
    }
  }, []);

  useEffect(() => {
    getInferenceResult(token);
  }, [token, getInferenceResult]);

  const templateResultLink = WebUrl.w2lResultPage(token);

  const handleDeleteFormSubmit = (
    ev: React.FormEvent<HTMLFormElement>
  ): boolean => {
    ev.preventDefault();

    const endpointUrl = new ApiConfig().deleteW2lInferenceResult(token);

    const request = {
      set_delete: !currentlyDeleted,
      as_mod: props.sessionWrapper.canDeleteOtherUsersW2lResults(),
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
        if (res.success) {
          if (props.sessionWrapper.canDeleteOtherUsersW2lResults()) {
            history.push(templateResultLink); // Mods can perform further actions
          } else {
            history.push("/");
          }
        }
      })
      .catch((e) => {});
    return false;
  };

  let creatorLink = <span />;

  if (!!w2lInferenceResult?.maybe_creator_display_name) {
    const creatorUrl = WebUrl.userProfilePage(
      w2lInferenceResult?.maybe_creator_display_name
    );
    creatorLink = (
      <Link to={creatorUrl}>
        {w2lInferenceResult?.maybe_creator_display_name}
      </Link>
    );
  }

  let currentlyDeleted =
    !!w2lInferenceResult?.maybe_moderator_fields?.mod_deleted_at ||
    !!w2lInferenceResult?.maybe_moderator_fields?.result_creator_deleted_at;

  const h1Title = currentlyDeleted ? "Undelete Result?" : "Delete Result?";

  const buttonTitle = currentlyDeleted ? "Confirm Undelete" : "Confirm Delete";

  const buttonCss = currentlyDeleted
    ? "btn btn-primary w-100"
    : "btn btn-primary w-100";

  const formLabel = currentlyDeleted
    ? "Recover the W2L Result (makes it visible again)"
    : "Delete W2L Result (hides from everyone but mods)";

  const durationSeconds = (w2lInferenceResult?.duration_millis || 0) / 1000;

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-5 pb-4 px-md-4 px-lg-5 px-xl-3">
        <motion.h1 className="display-5 fw-bold" variants={item}>
          {h1Title}
        </motion.h1>
        <motion.div className="pt-3" variants={item}>
          <Link to={templateResultLink}>&lt; Back to result</Link>
        </motion.div>
      </div>

      <motion.form onSubmit={handleDeleteFormSubmit} variants={panel}>
        <div className="container-panel pt-4 pb-5">
          <div className="panel p-3 py-4 p-lg-4">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <abbr title="Detail">Detail</abbr>
                  </th>
                  <th>
                    <abbr title="Value">Value</abbr>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Creator</th>
                  <td>{creatorLink}</td>
                </tr>
                <tr>
                  <th>Template title</th>
                  <td>{w2lInferenceResult?.template_title}</td>
                </tr>
                <tr>
                  <th>Duration</th>
                  <td>{durationSeconds} seconds</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <motion.div className="container pb-5" variants={item}>
          <button className={buttonCss}>{buttonTitle}</button>
          <motion.p className="pt-4" variants={item}>
            {formLabel}
          </motion.p>
        </motion.div>
      </motion.form>
    </motion.div>
  );
}

export { W2lResultDeletePage };
