import React, { useState, useEffect, useCallback } from 'react';
import { GravatarFc } from '../../_common/GravatarFc';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { ReportDiscordLinkFc } from '../../_common/DiscordReportLinkFc';
import { BucketConfig } from '@storyteller/components/src/api/BucketConfig';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { DownloadIcon } from '../../_icons/DownloadIcon';
import { GetW2lResult, GetW2lResultIsErr, GetW2lResultIsOk, W2lResult, W2lResultLookupError } from '../../../api/w2l/GetW2lResult';
import { MetaTags } from '../../../../common/MetaTags';

interface Props {
  sessionWrapper: SessionWrapper,
}

function W2lResultViewFc(props: Props) {
  let { token } = useParams() as { token : string };

  const [w2lInferenceResult, setW2lInferenceResult] = useState<W2lResult|undefined>(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const getInferenceResult = useCallback(async (token) => {
    const templateResponse = await GetW2lResult(token);
    if (GetW2lResultIsOk(templateResponse)) {
      setW2lInferenceResult(templateResponse)
    } else if (GetW2lResultIsErr(templateResponse)) {
      switch(templateResponse) {
        case W2lResultLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
  }, []);

  useEffect(() => {
    getInferenceResult(token);
  }, [token, getInferenceResult]); // NB: Empty array dependency sets to run ONLY on mount

  if (notFoundState) {
    return (
      <h1 className="title is-1">Template result not found</h1>
    );
  }

  if (!w2lInferenceResult) {
    return <div />
  }

  let videoLink = new BucketConfig().getGcsUrl(w2lInferenceResult?.public_bucket_video_path);
  let templateLink = `/w2l/${w2lInferenceResult.maybe_w2l_template_token}`;
  let videoDownloadFilename = `vocodes-${w2lInferenceResult.w2l_result_token.replace(':', '')}.mp4`;

  MetaTags.setVideoUrl(videoLink);
  MetaTags.setTitle('testing...');

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
          <th>Template creator is banned</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.template_creator_is_banned ? "banned" : "good standing" }</td>
        </tr>
        <tr>
          <th>Result creator is banned (if user)</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.result_creator_is_banned_if_user ? "banned" : "good standing" }</td>
        </tr>
        <tr>
          <th>Result creator IP address</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.result_creator_ip_address || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>Result creator deleted at (UTC)</th>
          <td>{w2lInferenceResult?.maybe_moderator_fields?.result_creator_deleted_at || "not deleted"}</td>
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
      !!w2lInferenceResult?.maybe_moderator_fields?.result_creator_deleted_at;

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
