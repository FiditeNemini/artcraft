import React, { useState, useEffect, useCallback } from "react";
import { ApiConfig } from "@storyteller/components";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams, Link, useHistory } from "react-router-dom";
import {
  GetW2lTemplate,
  GetW2lTemplateIsOk,
  W2lTemplate,
} from "../../../api/w2l/GetW2lTemplate";
import { GetW2lTemplateUseCount } from "../../../api/w2l/GetW2lTemplateUseCount";
import { BackLink } from "../../_common/BackLink";
import { distance, delay, duration } from "../../../../data/animation";
const Fade = require("react-reveal/Fade");

const DEFAULT_APPROVED_STATE = true;

interface Props {
  sessionWrapper: SessionWrapper;
}

function W2lTemplateApproveFc(props: Props) {
  const history = useHistory();

  let { templateToken }: { templateToken: string } = useParams();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate | undefined>(
    undefined
  );
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<
    number | undefined
  >(undefined);
  const [approvedState, setApprovedState] = useState<boolean | null>(
    DEFAULT_APPROVED_STATE
  );

  const getTemplate = useCallback(async (templateToken) => {
    const template = await GetW2lTemplate(templateToken);

    if (GetW2lTemplateIsOk(template)) {
      setW2lTemplate(template);
      const currentlyApproved = template?.is_public_listing_approved;
      setApprovedState(currentlyApproved);
    }
  }, []);

  const getTemplateUseCount = useCallback(async (templateToken) => {
    const count = await GetW2lTemplateUseCount(templateToken);
    setW2lTemplateUseCount(count || 0);
  }, []);

  const templateLink = FrontendUrlConfig.w2lTemplatePage(templateToken);

  useEffect(() => {
    getTemplate(templateToken);
    getTemplateUseCount(templateToken);
  }, [templateToken, getTemplate, getTemplateUseCount]);

  const handleModApprovalChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = (ev.target as HTMLSelectElement).value;
    const updatedValue = value === "true" ? true : false;
    setApprovedState(updatedValue);
  };

  const handleApproveFormSubmit = (
    ev: React.FormEvent<HTMLFormElement>
  ): boolean => {
    ev.preventDefault();

    const endpointUri = new ApiConfig().moderateW2l(templateToken);

    const request = {
      is_approved: approvedState || false,
    };

    fetch(endpointUri, {
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
          history.push(templateLink);
        }
      })
      .catch((e) => {});
    return false;
  };

  let creatorLink = <span />;

  if (!!w2lTemplate?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(
      w2lTemplate?.creator_display_name
    );
    creatorLink = (
      <Link to={creatorUrl}>{w2lTemplate?.creator_display_name}</Link>
    );
  }

  const currentlyApproved = w2lTemplate?.is_public_listing_approved;

  const h1Title = currentlyApproved
    ? "Unapprove Template?"
    : "Approve Template?";

  let humanUseCount: string | number = "Fetching...";

  const approvedFormDefaultState = approvedState ? "true" : "false";

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  return (
    <div>
      <Fade bottom cascade duration={duration} distance={distance}>
        <div className="container pt-5 pb-4 px-lg-5 px-xl-3">
          <div className="d-flex flex-column">
            <h1 className="display-5 fw-bold">{h1Title}</h1>
          </div>
          <div className="pt-3">
            <BackLink link={templateLink} text="Back to template" />
          </div>
        </div>
      </Fade>

      <Fade
        bottom
        cascade
        duration={duration}
        delay={delay}
        distance={distance}
      >
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
                  <th>Use Count</th>
                  <td>{humanUseCount}</td>
                </tr>
                <tr>
                  <th>Title</th>
                  <td>{w2lTemplate?.title}</td>
                </tr>
                <tr>
                  <th>Upload Date (UTC)</th>
                  <td>{w2lTemplate?.created_at}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleApproveFormSubmit}>
          <div className="container-panel pt-1 pb-5">
            <div className="panel p-3 py-4 p-lg-4">
              <label className="sub-title">
                Mod Approval (sets public list visibility)
              </label>

              <div>
                <div className="form-group">
                  <select
                    name="approve"
                    value={approvedFormDefaultState}
                    onChange={handleModApprovalChange}
                    className="form-select"
                  >
                    <option value="true">Approve</option>
                    <option value="false">Disapprove</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="container pb-5">
            <button className="btn btn-primary w-100">Moderate</button>
          </div>
        </form>
      </Fade>
    </div>
  );
}

export { W2lTemplateApproveFc };
