import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ApiConfig } from '../../../../common/ApiConfig';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { W2lInferenceJob } from '../../../../App';
import { useParams, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { SessionW2lInferenceResultListFc } from '../../_common/SessionW2lInferenceResultsListFc';
import { ReportDiscordLinkFc } from '../../_common/DiscordReportLinkFc';
import { BucketConfig } from '../../../../common/BucketConfig';
import { UploadIcon } from '../../_icons/UploadIcon';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { GetW2lTemplate, W2lTemplate } from '../../../api/w2l/GetW2lTemplate';
import { GetW2lTemplateUseCount } from '../../../api/w2l/GetW2lTemplateUseCount';

interface EnqueueJobResponsePayload {
  success: boolean,
  inference_job_token?: string,
}

interface Props {
  sessionWrapper: SessionWrapper,
  enqueueW2lJob: (jobToken: string) => void,
  w2lInferenceJobs: Array<W2lInferenceJob>,
}

function W2lTemplateViewFc(props: Props) {
  let { templateSlug } : { templateSlug : string } = useParams();

  // Ajax
  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);

  // Inference
  const [audioFile, setAudioFile] = useState<File|undefined>(undefined);

  // Moderation
  const [modApprovedFormValue, setModApprovedFormValue] = useState<boolean>(true);

  const getTemplate = useCallback(async (templateSlug: string) => {
    const templateResponse = await GetW2lTemplate(templateSlug);

    if (!templateResponse) {
      return;
    }

    setW2lTemplate(templateResponse)

    let modApprovalState = templateResponse?.is_public_listing_approved;
    if (modApprovedFormValue === undefined || modApprovalState === null) {
      modApprovalState = true;
    }

    setModApprovedFormValue(modApprovalState);

  }, [modApprovedFormValue]);

  const getTemplateUseCount = useCallback(async (templateToken) => {
    const count = await GetW2lTemplateUseCount(templateToken);
    setW2lTemplateUseCount(count || 0)
  }, []);

  useEffect(() => {
    getTemplate(templateSlug);
    getTemplateUseCount(templateSlug);
  }, [templateSlug, getTemplate, getTemplateUseCount]);

  const handleAudioFileChange = (fileList: FileList|null) => {
    if (fileList === null 
        || fileList === undefined
        || fileList.length < 1) {
      setAudioFile(undefined);
    }

    let file = fileList![0];
    setAudioFile(file);
  };

  const handleInferenceFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    if (audioFile === undefined) {
      return false;
    }

    if (w2lTemplate === undefined) {
      return false;
    }

    const templateToken = w2lTemplate!.template_token;

    let formData = new FormData();
    formData.append('audio', audioFile!);
    formData.append('template_token', templateToken);
    formData.append('uuid_idempotency_token', uuidv4()!);

    const api = new ApiConfig();
    const endpointUrl = api.inferW2l();

    // NB: Using 'axios' because 'fetch' was having problems with form-multipart
    // and then interpreting the resultant JSON. Maybe I didn't try hard enough?
    axios.post(endpointUrl, formData, { withCredentials: true }) 
      .then(res => res.data)
      .then(res => {
        console.log('w2l submitted');
        let response : EnqueueJobResponsePayload = res;
        if (!response.success || response.inference_job_token === undefined) {
          return;
        }
        console.log('w2l enqueueing');
        props.enqueueW2lJob(response.inference_job_token);
      });


    return false;
  };

  let creatorLink=`/profile/${w2lTemplate?.creator_username}`;
  let object : string|undefined = undefined;
  
  if (w2lTemplate?.maybe_image_object_name !== undefined && w2lTemplate?.maybe_image_object_name !== null) {
    object = w2lTemplate!.maybe_image_object_name;
  } else if (w2lTemplate?.maybe_video_object_name !== undefined && w2lTemplate?.maybe_video_object_name !== null) {
    object = w2lTemplate!.maybe_video_object_name;
  } else {
  }

  let url = new BucketConfig().getGcsUrl(object);

  let audioFilename = '(select a file)';
  if (audioFile !== undefined) {
    audioFilename = audioFile?.name;
  }

  let modApprovalStatus = <span />;

  switch (w2lTemplate?.is_public_listing_approved) {
    case null:
      modApprovalStatus = (
        <span>
          Not yet (ask for approval in our&nbsp;<a 
          href="https://discord.gg/H72KFXm" target="_blank" rel="noopener noreferrer">Discord</a>)
        </span>
      );
      break;
    case true:
      modApprovalStatus = <span>Approved</span>;
      break;
    case false:
      modApprovalStatus = <span>Not Approved</span>;
      break;
  }

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
          <th>Create IP address</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_ip_address_creation || "server error"}</td>
        </tr>
        <tr>
          <th>Update IP address</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.creator_ip_address_last_update || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>{w2lTemplate?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  let humanUseCount : string | number = 'Fetching...';

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  let editButton = <span />;

  if (props.sessionWrapper.canEditTtsModelByUserToken(w2lTemplate?.creator_user_token)) {
    editButton = (
      <>
        <br />
        <Link 
          className={"button is-large is-info is-fullwidth"}
          to={FrontendUrlConfig.w2lTemplateEditPage(templateSlug)}
          >Edit Template Details</Link>
      </>
    );
  }

  let approveButton = <span />;

  if (props.sessionWrapper.canApproveW2lTemplates()) {
    const currentlyApproved = w2lTemplate?.is_public_listing_approved;

    const approveButtonTitle = currentlyApproved? "Unapprove Template?" : "Approve Template?";

    const approveButtonCss = currentlyApproved? 
      "button is-danger is-light is-large is-fullwidth" :
      "button is-info is-light is-large is-fullwidth";

    approveButton = (
      <>
        <br />
        <Link 
          className={approveButtonCss}
          to={FrontendUrlConfig.w2lTemplateApprovalPage(templateSlug)}
          >{approveButtonTitle}</Link>
      </>
    );
  }

  let deleteButton = <span />;

  if (props.sessionWrapper.canDeleteTtsModelByUserToken(w2lTemplate?.creator_user_token)) {

    const currentlyDeleted = !!w2lTemplate?.maybe_moderator_fields?.mod_deleted_at || 
        !!w2lTemplate?.maybe_moderator_fields?.user_deleted_at;

    const deleteButtonTitle = currentlyDeleted ? "Undelete Template?" : "Delete Template?";

    const deleteButtonCss = currentlyDeleted ? 
      "button is-warning is-large is-fullwidth" :
      "button is-danger is-large is-fullwidth";

    deleteButton = (
      <>
        <br />
        <Link 
          className={deleteButtonCss}
          to={FrontendUrlConfig.w2lTemplateDeletePage(templateSlug)}
          >{deleteButtonTitle}</Link>
      </>
    );
  }

  let templateDescription = null;

  if (!!w2lTemplate?.description_rendered_html) {
    templateDescription = (
      <>
        <h4 className="title is-4"> Model Description </h4>
        <div 
          className="profile content is-medium" 
          dangerouslySetInnerHTML={{__html: w2lTemplate?.description_rendered_html || ""}}
          />
      </>
    );
  }

  const resultVisibility = w2lTemplate?.creator_set_visibility === 'hidden' ? 
    <span>Hidden <HiddenIconFc /></span> :
    <span>Public <VisibleIconFc /></span> ;

  return (
    <div>
      <h1 className="title is-1"> Video lip sync template </h1>

      <div className="content">
        <p>
          <Link to={FrontendUrlConfig.w2lListPage()}>&lt; Back to all templates</Link>
        </p>
      </div>

      <div className="content is-size-4">
        <p>
          Upload audio from vo.codes or any other source (music, other websites), 
          then submit. You'll get a lipsynced video. The audio shouldn't be too 
          long or it will fail.
        </p>
      </div>

      <form onSubmit={handleInferenceFormSubmit}>

        <div className="upload-box">
          <div className="file has-name is-large">
            <label className="file-label">
              <input 
                type="file" 
                name="audio" 
                className="file-input" 
                onChange={ (e) => handleAudioFileChange(e.target.files) }
                />
              <span className="file-cta">
                <UploadIcon />&nbsp;
                <span className="file-label">
                  Choose audio file&hellip;
                </span>
              </span>
              <span className="file-name">
                {audioFilename}
              </span>
            </label>
          </div>
        </div>

        <button className="button is-large is-fullwidth is-success">Submit</button>

      </form>

      <br />

      <div className="template-preview">
        <img src={url} alt="template preview" />
      </div>

      <br />

      {templateDescription}

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> Template Details </h4>
            </td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{w2lTemplate?.title}</td>
          </tr>
          <tr>
            <th>Creator</th>
            <td>
              <Link to={creatorLink}>{w2lTemplate?.creator_display_name}</Link>
            </td>
          </tr>
          <tr>
            <th>Use count</th>
            <td>{humanUseCount}</td>
          </tr>
          <tr>
            <th>Visibility</th>
            <td>{resultVisibility}</td>
          </tr>
          <tr>
            <th>Is public listing approved?</th>
            <td>{modApprovalStatus}</td>
          </tr>
          <tr>
            <td colSpan={2}>
              <br />
              <h4 className="subtitle is-4"> Media Details </h4>
            </td>
          </tr>
          <tr>
            <th>Media type</th>
            <td>{w2lTemplate?.template_type}</td>
          </tr>
          <tr>
            <th>Dimensions</th>
            <td>{w2lTemplate?.frame_width} x {w2lTemplate?.frame_height}</td>
          </tr>
          <tr>
            <th>Duration (milliseconds)</th>
            <td>{w2lTemplate?.duration_millis}</td>
          </tr>
          <tr>
            <th>Created at (UTC)</th>
            <td>{w2lTemplate?.created_at}</td>
          </tr>
          <tr>
            <th>Updated at (UTC)</th>
            <td>{w2lTemplate?.updated_at}</td>
          </tr>

          {moderatorRows}

        </tbody>
      </table>

      {editButton}

      {approveButton}

      {deleteButton}

      <br />
      <SessionW2lInferenceResultListFc w2lInferenceJobs={props.w2lInferenceJobs} />

      <div className="content">
        <p>
          <Link to={FrontendUrlConfig.w2lListPage()}>&lt; Back to all templates</Link>
        </p>
      </div>

      <br />
      <ReportDiscordLinkFc />
    </div>
  )
}

export { W2lTemplateViewFc };
