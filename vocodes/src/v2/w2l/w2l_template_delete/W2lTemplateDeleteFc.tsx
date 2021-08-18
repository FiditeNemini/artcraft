
import React, { useState, useEffect, useCallback } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link, useHistory } from 'react-router-dom';

interface W2lTemplateViewResponsePayload {
  success: boolean,
  template: W2lTemplate,
}

interface W2lTemplateUseCountResponsePayload {
  success: boolean,
  count: number | null | undefined,
}

interface W2lTemplate {
  template_token: string,
  template_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  updatable_slug: string,
  title: string,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  maybe_image_object_name: string,
  maybe_video_object_name: string,
  creator_set_visibility: string,
  is_public_listing_approved: boolean | null,
  created_at: string,
  updated_at: string,
  maybe_moderator_fields: W2lTemplateModeratorFields | null | undefined,
}

interface W2lTemplateModeratorFields {
  creator_ip_address_creation: string,
  creator_ip_address_last_update: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lTemplateDeleteFc(props: Props) {
  const history = useHistory();

  let { token } = useParams() as { token : string };

  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);

  const getModel = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2lTemplate(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templateResponse : W2lTemplateViewResponsePayload = res;
      if (!templateResponse.success) {
        return;
      }

      setW2lTemplate(templateResponse.template)
    })
    .catch(e => {});
  }, []);

  const getModelUseCount = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lTemplateUseCount(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lTemplateUseCountResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lTemplateUseCount(templatesResponse.count || 0)
    })
    .catch(e => {});
  }, []);

  const templateLink = FrontendUrlConfig.w2lTemplatePage(token);

  useEffect(() => {
    getModel(token);
    getModelUseCount(token);
  }, [token, getModel, getModelUseCount]);

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteW2lTemplate(token);

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

  const h1Title = currentlyDeleted ? "Undelete Model?" : "Delete Model?";

  const buttonTitle = currentlyDeleted ? "Confirm Undelete" : "Confirm Delete";

  const buttonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  const formLabel = currentlyDeleted ? 
     "Recover the TTS Model (makes it visible again)" : 
     "Delete TTS Model (hides from everyone but mods)";

  let humanUseCount : string | number = 'Fetching...';

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersW2lTemplates()) {
    moderatorRows = (
      <>
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
        <Link to="/">&lt; Back to all templates</Link>
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
      <Link to="/">&lt; Back to all templates</Link>
    </div>
  )
}

export { W2lTemplateDeleteFc };
