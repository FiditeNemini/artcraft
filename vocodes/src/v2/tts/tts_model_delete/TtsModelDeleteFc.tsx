
import React, { useState, useEffect, useCallback } from 'react';
//import axios from 'axios';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';

interface TtsModelViewResponsePayload {
  success: boolean,
  model: TtsModel,
}

interface TtsModelUseCountResponsePayload {
  success: boolean,
  count: number | null | undefined,
}

interface TtsModel {
  model_token: string,
  title: string,
  tts_model_type: string,
  text_preprocessing_algorithm: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  description_markdown: string,
  description_rendered_html: string,
  updatable_slug: string,
  created_at: string,
  updated_at: string,
  maybe_moderator_fields: TtsModelModeratorFields | null | undefined,
}

interface TtsModelModeratorFields {
  creator_ip_address_creation: string,
  creator_ip_address_last_update: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsModelDeleteFc(props: Props) {
  let { token } = useParams() as { token : string };

  const [ttsModel, setTtsModel] = useState<TtsModel|undefined>(undefined);
  const [ttsModelUseCount, setTtsModelUseCount] = useState<number|undefined>(undefined);

  const getModel = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.viewTtsModel(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelViewResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModel(modelsResponse.model)
    })
    .catch(e => {});
  }, []);

  const getModelUseCount = useCallback((token) => {
    const api = new ApiConfig();
    const endpointUrl = api.getTtsModelUseCount(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsModelUseCountResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsModelUseCount(modelsResponse.count || 0)
    })
    .catch(e => {});
  }, []);


  useEffect(() => {
    getModel(token);
    getModelUseCount(token);
  }, [token, getModel, getModelUseCount]);

  let creatorLink = <span />;

  if (!!ttsModel?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(ttsModel?.creator_display_name);
    creatorLink = (
      <Link to={creatorUrl}>{ttsModel?.creator_display_name}</Link>
    );
  }

  let deleted = !!ttsModel?.maybe_moderator_fields?.mod_deleted_at ||
      !!ttsModel?.maybe_moderator_fields?.user_deleted_at ||
      false;

  let title = deleted ? 'Undelete TTS Model' : 'Delete TTS Model';

  let humanUseCount : string | number = 'Fetching...';

  if (ttsModelUseCount !== undefined && ttsModelUseCount !== null) {
    humanUseCount = ttsModelUseCount;
  }

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersTtsModels()) {
    moderatorRows = (
      <>
        <tr>
          <th>Creator IP Address (Creation)</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Creator IP Address (Update)</th>
          <td>{ttsModel?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
        </tr>
        <tr>
          <th>Mod Deleted At (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User Deleted At (UTC)</th>
          <td>{ttsModel?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  let editModelButton = <span />

  if (!!ttsModel?.creator_user_token) {
    if (props.sessionWrapper.canEditTtsModelByUserToken(ttsModel.creator_user_token)) {
      let editLinkUrl = FrontendUrlConfig.ttsModelEditPage(token);
      editModelButton = (
          <Link 
            className={"button is-medium is-info"}
            to={editLinkUrl}>Edit Model Details</Link>
      );
    }
  }

  return (
    <div className="content">
      <h1 className="title is-1"> {title} </h1>
      
      <p>
        <Link to="/">&lt; Back to all models</Link>
      </p>
      
      <h4 className="title is-4"> Use Model </h4>

      <h4 className="title is-4"> Model Details </h4>

      <div 
        className="profile content is-medium" 
        dangerouslySetInnerHTML={{__html: ttsModel?.description_rendered_html || ""}}
        />

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
            <td>{ttsModel?.title}</td>
          </tr>
          <tr>
            <th>Model Type</th>
            <td>{ttsModel?.tts_model_type}</td>
          </tr>
          <tr>
            <th>Text Preprocessing Algorithm</th>
            <td>{ttsModel?.text_preprocessing_algorithm}</td>
          </tr>
          <tr>
            <th>Upload Date (UTC)</th>
            <td>{ttsModel?.created_at}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      <br />

      {editModelButton}

      <br />
      <br />
      <Link to="/">&lt; Back to all models</Link>
    </div>
  )
}

export { TtsModelDeleteFc };
