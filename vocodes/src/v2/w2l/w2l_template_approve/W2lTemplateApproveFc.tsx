import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';
import { GetW2lTemplate, W2lTemplate } from '../../api/w2l/GetW2lTemplate';
import { GetW2lTemplateUseCount } from '../../api/w2l/GetW2lTemplateUseCount';

const DEFAULT_APPROVED_STATE = true;

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateApproveFc(props: Props) {
  const history = useHistory();

  let { templateToken } : { templateToken : string } = useParams();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);
  const [approvedState, setApprovedState] = useState<boolean|null>(DEFAULT_APPROVED_STATE);

  const getTemplate = useCallback(async (templateToken) => {
    const template = await GetW2lTemplate(templateToken);
    if (template) {
      setW2lTemplate(template)
      const currentlyApproved = template?.is_public_listing_approved;
      setApprovedState(currentlyApproved);
    }
  }, []);

  const getTemplateUseCount = useCallback(async (templateToken) => {
    const count = await GetW2lTemplateUseCount(templateToken);
    setW2lTemplateUseCount(count || 0)
  }, []);

  const templateLink = FrontendUrlConfig.w2lTemplatePage(templateToken);

  useEffect(() => {
    getTemplate(templateToken);
    getTemplateUseCount(templateToken);
  }, [templateToken, getTemplate, getTemplateUseCount]);

  const handleModApprovalChange= (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = (ev.target as HTMLSelectElement).value;
    const updatedValue = value === "true" ? true : false;
    setApprovedState(updatedValue)
  };

  const handleApproveFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const endpointUri = new ApiConfig().moderateW2l(templateToken);

    const request = {
      is_approved: approvedState || false,
    }

    fetch(endpointUri, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        history.push(templateLink);
      }
    })
    .catch(e => {
    });
    return false;
  }

  let creatorLink = <span />;

  if (!!w2lTemplate?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(w2lTemplate?.creator_display_name);
    creatorLink = (
      <Link to={creatorUrl}>{w2lTemplate?.creator_display_name}</Link>
    );
  }

  const currentlyApproved = w2lTemplate?.is_public_listing_approved;

  const h1Title = currentlyApproved ? "Unapprove Template?" : "Approve Template?";

  const buttonTitle = currentlyApproved ? "Confirm Unapprove" : "Confirm Approve";

  const buttonCss = currentlyApproved ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = currentlyApproved ? 
     "Recover the W2L Template (makes it visible again)" : 
     "Approve W2L Template (hides from everyone but mods)";

  let humanUseCount : string | number = 'Fetching...';

  const approvedFormDefaultState = approvedState ? "true" : "false";

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  return (
    <div className="content">
      <h1 className="title is-1"> {h1Title} </h1>
      
      <p>
        <Link to={templateLink}>&lt; Back to template</Link>
      </p>
      
      <table className="table">
        <thead>
          <tr>
            <th><abbr title="Detail">Detail</abbr></th>
            <th><abbr title="Value">Value</abbr></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Creator</th>
            <td>
              {creatorLink}
            </td>
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

      <br />

      <form onSubmit={handleApproveFormSubmit}>
        <label className="label">Mod Approval (sets public list visibility)</label>

        <div className="field is-grouped">
          <div className="control">

            <div className="select is-info is-large">
              <select name="approve" value={approvedFormDefaultState} onChange={handleModApprovalChange}>
                <option value="true">Approve</option>
                <option value="false">Disapprove</option>
              </select>
            </div>
          </div>

          <p className="control">
            <button className="button is-info is-large">
              Moderate
            </button>
          </p>

        </div>
      </form>

      <br />
      <br />
      <Link to={templateLink}>&lt; Back to template</Link>
    </div>
  )
}

export { W2lTemplateApproveFc };
