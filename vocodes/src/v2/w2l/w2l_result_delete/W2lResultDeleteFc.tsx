
import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';
import { GetW2lTemplateUseCount } from '../../api/w2l/GetW2lTemplateUseCount';
import { GetW2lResult, W2lResult } from '../../api/w2l/GetW2lResult';

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lResultDeleteFc(props: Props) {
  const history = useHistory();

  let { token } = useParams() as { token : string };

  const [w2lTemplate, setW2lTemplate] = useState<W2lResult|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);

  const getTemplate = useCallback(async (token) => {
    const templateResponse = await GetW2lResult(token);
    if (templateResponse) {
      setW2lTemplate(templateResponse)
    }
  }, []);

  const getTemplateUseCount = useCallback(async (token) => {
    const count = await GetW2lTemplateUseCount(token);
    setW2lTemplateUseCount(count || 0)
  }, []);

  useEffect(() => {
    getTemplate(token);
    getTemplateUseCount(token);
  }, [token, getTemplate, getTemplateUseCount]);

  const templateResultLink = FrontendUrlConfig.w2lResultPage(token);

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const endpointUrl = new ApiConfig().deleteW2lInferenceResult(token);

    const request = {
      set_delete: !currentlyDeleted,
      as_mod: props.sessionWrapper.canDeleteOtherUsersW2lResults(),
    }

    fetch(endpointUrl, {
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
        if (props.sessionWrapper.canDeleteOtherUsersW2lResults()) {
          history.push(templateResultLink); // Mods can perform further actions
        } else {
          history.push('/');
        }
      }
    })
    .catch(e => {
    });
    return false;
  }

  let creatorLink = <span />;

  if (!!w2lTemplate?.maybe_creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(w2lTemplate?.maybe_creator_display_name);
    creatorLink = (
      <Link to={creatorUrl}>{w2lTemplate?.maybe_creator_display_name}</Link>
    );
  }

  let currentlyDeleted = !!w2lTemplate?.maybe_moderator_fields?.mod_deleted_at ||
      !!w2lTemplate?.maybe_moderator_fields?.user_deleted_at;

  const h1Title = currentlyDeleted ? "Undelete Result?" : "Delete Result?";

  const buttonTitle = currentlyDeleted ? "Confirm Undelete" : "Confirm Delete";

  const buttonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = currentlyDeleted ? 
     "Recover the W2L Result (makes it visible again)" : 
     "Delete W2L Result (hides from everyone but mods)";

  let humanUseCount : string | number = 'Fetching...';

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersW2lResults() || props.sessionWrapper.canDeleteOtherUsersW2lTemplates()) {
    moderatorRows = (
      <>
        <tr>
          <th>Creator IP address</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_ip_address || "server error"}</td>
        </tr>
        <tr>
          <th>Mod Deleted At (UTC)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User Deleted At (UTC)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  return (
    <div className="content">
      <h1 className="title is-1"> {h1Title} </h1>
      
      <p>
        <Link to={templateResultLink}>&lt; Back to result</Link>
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
            <td>{w2lTemplate?.template_title}</td>
          </tr>
          <tr>
            <th>Upload Date (UTC)</th>
            <td>{w2lTemplate?.created_at}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      <br />

      <form onSubmit={handleDeleteFormSubmit}>
        <label className="label">{formLabel}</label>

        <p className="control">
          <button className={buttonCss}>
            {buttonTitle}
          </button>
        </p>
      </form>

      <br />
      <br />
      <Link to={templateResultLink}>&lt; Back to result</Link>
    </div>
  )
}

export { W2lResultDeleteFc };
