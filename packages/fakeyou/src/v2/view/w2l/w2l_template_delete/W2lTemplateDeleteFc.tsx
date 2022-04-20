import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '@storyteller/components';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';
import { GetW2lTemplate, GetW2lTemplateIsOk, W2lTemplate } from '../../../api/w2l/GetW2lTemplate';
import { GetW2lTemplateUseCount } from '../../../api/w2l/GetW2lTemplateUseCount';
import { BackLink } from '../../_common/BackLink';

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateDeleteFc(props: Props) {
  const history = useHistory();

  let { templateToken } : { templateToken : string } = useParams();

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);

  const getTemplate = useCallback(async (templateToken) => {
    const template = await GetW2lTemplate(templateToken);

    if (GetW2lTemplateIsOk(template)) {
      setW2lTemplate(template)
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

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteW2lTemplate(templateToken);

    const request = {
      set_delete: !currentlyDeleted,
      as_mod: props.sessionWrapper.deleteTtsResultAsMod(w2lTemplate?.creator_user_token)
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
        if (props.sessionWrapper.canDeleteOtherUsersTtsResults()) {
          history.push(templateLink); // Mods can perform further actions
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

  if (!!w2lTemplate?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(w2lTemplate?.creator_display_name);
    creatorLink = (
      <Link to={creatorUrl}>{w2lTemplate?.creator_display_name}</Link>
    );
  }

  let currentlyDeleted = !!w2lTemplate?.maybe_moderator_fields?.mod_deleted_at ||
      !!w2lTemplate?.maybe_moderator_fields?.user_deleted_at;

  const h1Title = currentlyDeleted ? "Undelete Template?" : "Delete Template?";

  const buttonTitle = currentlyDeleted ? "Confirm Undelete" : "Confirm Delete";

  const buttonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = currentlyDeleted ? 
     "Recover the W2L Template (makes it visible again)" : 
     "Delete W2L Template (hides from everyone but mods)";

  let humanUseCount : string | number = 'Fetching...';

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersW2lTemplates()) {
    moderatorRows = (
      <>
        <tr>
          <th>Creator is banned</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_is_banned ? "banned" : "good standing" }</td>
        </tr>
        <tr>
          <th>Creator IP Address (Creation)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Creator IP Address (Update)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
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
        <BackLink link={templateLink} text="Back to template" />
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
      <BackLink link={templateLink} text="Back to template" />
    </div>
  )
}

export { W2lTemplateDeleteFc };
