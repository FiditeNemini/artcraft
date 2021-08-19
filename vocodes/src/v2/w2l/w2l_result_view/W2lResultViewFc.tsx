import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { GravatarFc } from '../../common/GravatarFc';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { ReportDiscordLinkFc } from '../../common/DiscordReportLinkFc';
import { BucketConfig } from '../../../common/BucketConfig';
import { HiddenIconFc } from '../../../icons/HiddenIconFc';
import { VisibleIconFc } from '../../../icons/VisibleIconFc';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { DownloadIcon } from '../../../icons/DownloadIcon';

interface W2lInferenceResultResponsePayload {
  success: boolean,
  result: W2lInferenceResult,
}

interface W2lInferenceResult {
  w2l_result_token: string,
  maybe_w2l_template_token?: string,
  maybe_tts_inference_result_token?: string,
  public_bucket_video_path: string,
  template_type: string,
  template_title: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  maybe_creator_gravatar_hash?: string,

  maybe_template_creator_user_token?: string,
  maybe_template_creator_username?: string,
  maybe_template_creator_display_name?: string,
  maybe_template_creator_gravatar_hash?: string,

  creator_set_visibility?: string,

  file_size_bytes: number,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

  maybe_moderator_fields: W2lInferenceResultModeratorFields | null | undefined,
}

interface W2lInferenceResultModeratorFields {
  creator_ip_address: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lResultViewFc(props: Props) {
  let { token } = useParams() as { token : string };

  const [w2lInferenceResult, setW2lInferenceResult] = useState<W2lInferenceResult|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2lInferenceResult(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lInferenceResultResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lInferenceResult(templatesResponse.result)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [token]); // NB: Empty array dependency sets to run ONLY on mount

  if (w2lInferenceResult === undefined) {
    return <div />;
  }

  let videoLink = new BucketConfig().getGcsUrl(w2lInferenceResult?.public_bucket_video_path);
  let templateLink = `/w2l/${w2lInferenceResult.maybe_w2l_template_token}`;
  let videoDownloadFilename = `vocodes-${w2lInferenceResult.w2l_result_token.replace(':', '')}.mp4`;

  let durationSeconds = w2lInferenceResult?.duration_millis / 1000;

  let templateName = w2lInferenceResult.template_title;


  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersW2lResults() || props.sessionWrapper.canDeleteOtherUsersW2lTemplates()) {
    moderatorRows = (
      <>
        <tr>
          <td colSpan={2}>
            <br />
            <h4 className="subtitle is-4"> Moderator Details </h4>
          </td>
        </tr>
        <tr>
          <th>Creator IP address</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.creator_ip_address || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  if (w2lInferenceResult.template_title.length < 5) {
    templateName = `Template: ${w2lInferenceResult.template_title}`;
  }

  let creatorDetails = <span>Anonymous user</span>;
  if (!!w2lInferenceResult.maybe_creator_user_token) {
    let creatorLink = `/profile/${w2lInferenceResult.maybe_creator_username}`;
    creatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={w2lInferenceResult.maybe_creator_display_name || ""} 
          email_hash={w2lInferenceResult.maybe_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={creatorLink}>{w2lInferenceResult.maybe_creator_display_name}</Link>
      </span>
    );
  }

  let templateCreatorDetails = <span>Anonymous user</span>;
  if (!!w2lInferenceResult.maybe_template_creator_user_token) {
    let templateCreatorLink = `/profile/${w2lInferenceResult.maybe_template_creator_username}`;
    templateCreatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={w2lInferenceResult.maybe_template_creator_display_name || ""} 
          email_hash={w2lInferenceResult.maybe_template_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={templateCreatorLink}>{w2lInferenceResult.maybe_template_creator_display_name}</Link>
      </span>
    );
  }

  let resultVisibility = w2lInferenceResult?.creator_set_visibility === 'hidden' ? 
    <span>Hidden <HiddenIconFc /></span> :
    <span>Public <VisibleIconFc /></span> ;

  const currentlyDeleted = !!w2lInferenceResult?.maybe_moderator_fields?.mod_deleted_at || 
      !!w2lInferenceResult?.maybe_moderator_fields?.user_deleted_at;

  const deleteButtonTitle = currentlyDeleted ? "Undelete Result?" : "Delete Result?";

  const deleteButtonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  let editButton = null;
  const canEdit = props.sessionWrapper.canEditW2lResultAsUserOrMod(w2lInferenceResult?.maybe_creator_user_token);

  if (canEdit) {
    editButton = (
      <>
        <br />
        <Link 
          className="button is-info is-large is-fullwidth"
          to={FrontendUrlConfig.w2lResultEditPage(token)}
          >Edit Result Visibility</Link>
      </>
    );
  }

  let deleteButton = null;
  const canDelete = props.sessionWrapper.canDeleteW2lResultAsUserOrMod(w2lInferenceResult?.maybe_creator_user_token);

  if (canDelete) {
    deleteButton = (
      <>
        <br />
        <Link 
          className={deleteButtonCss}
          to={FrontendUrlConfig.w2lResultDeletePage(token)}
          >{deleteButtonTitle}</Link>
      </>
    );
  }
  return (
    <div>
      <h1 className="title is-1"> Lipsync Result </h1>

      <video width="100%" height="auto" controls={true}>
        <source src={videoLink} />
        Your device doesn't support video.
      </video> 

      <br />
      <br />

      <a className="button is-large is-primary is-fullwidth" 
          href={videoLink}
          download={videoDownloadFilename}> <DownloadIcon />&nbsp;Download File</a>

      <br />
      <br />

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> Result Details </h4>
            </td>
          </tr>
          <tr>
            <th>Creator</th>
            <td>
              {creatorDetails}
            </td>
          </tr>
          <tr>
            <th>Duration</th>
            <td>{durationSeconds} seconds</td>
          </tr>
          <tr>
            <th>Visibility</th>
            <td>{resultVisibility}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <br />
              <h4 className="subtitle is-4"> Template Details </h4>
            </td>
          </tr>
          <tr>
            <th>Template used</th>
            <td>
              <Link to={templateLink}>
                {templateName}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Template creator</th>
            <td>
              {templateCreatorDetails}
            </td>
          </tr>
          <tr>
            <th>Dimensions</th>
            <td>{w2lInferenceResult?.frame_width} x {w2lInferenceResult?.frame_height}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      {editButton}

      {deleteButton}

      <br />
      <ReportDiscordLinkFc />
    </div>
  )
}

export { W2lResultViewFc };
