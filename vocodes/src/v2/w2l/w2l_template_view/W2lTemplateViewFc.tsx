import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { W2lInferenceJob } from '../../../App';
import { useParams, Link, useHistory } from 'react-router-dom';
import { v1 as uuidv1 } from 'uuid';
import { SessionW2lInferenceResultListFc } from '../../common/SessionW2lInferenceResultsListFc';
import { W2lTemplateViewDeleteFc } from './W2lTemplateView_DeleteFc';

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
  is_public_listing_approved: boolean | null,
  created_at: string,
  updated_at: string,
  deleted_at: string | undefined | null,
}

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
  let { templateSlug } = useParams() as { templateSlug: string };

  const history = useHistory();

  // Ajax
  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate|undefined>(undefined);
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<number|undefined>(undefined);

  // Inference
  const [audioFile, setAudioFile] = useState<File|undefined>(undefined);

  // Moderation
  const [modApprovedFormValue, setModApprovedFormValue] = useState<boolean>(true);

  const getTemplate = useCallback((templateSlug: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.viewW2l(templateSlug);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const templatesResponse : W2lTemplateViewResponsePayload = res;
      if (!templatesResponse.success) {
        return;
      }

      setW2lTemplate(templatesResponse.template)

      let modApprovalState = templatesResponse?.template?.is_public_listing_approved;
      if (modApprovedFormValue === undefined || modApprovalState === null) {
        modApprovalState = true;
      }

      setModApprovedFormValue(modApprovalState);
    })
    .catch(e => {});

  }, [templateSlug]);

  const getTemplateUseCount = useCallback((templateSlug: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lTemplateUseCount(templateSlug);

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

  }, [templateSlug]);

  useEffect(() => {
    getTemplate(templateSlug);
    getTemplateUseCount(templateSlug);
  }, [templateSlug]); // NB: Empty array dependency sets to run ONLY on mount

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
    formData.append('uuid_idempotency_token', uuidv1()!);

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

  const handleModApprovalChange= (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = (ev.target as HTMLSelectElement).value;
    const updatedValue = value === "true" ? true : false;
    setModApprovedFormValue(updatedValue)
  };

  const handleModApprovalFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.moderateW2l(templateSlug);

    const request = {
      is_approved: modApprovedFormValue,
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
        history.go(0); // force reload
      }
    })
    .catch(e => {
    });
    return false;
  }

  const handleDeleteFormSubmit = (ev: React.FormEvent<HTMLFormElement>) : boolean => {
    ev.preventDefault();

    const api = new ApiConfig();
    const endpointUrl = api.deleteW2l(templateSlug);

    const request = {
      set_delete: true,
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
        history.go(0); // force reload
      }
    })
    .catch(e => {
    });
    return false;
  }

  let creatorLink=`/profile/${w2lTemplate?.creator_username}`;
  let object : string|undefined = undefined;
  
  if (w2lTemplate?.maybe_image_object_name !== undefined && w2lTemplate?.maybe_image_object_name !== null) {
    object = w2lTemplate!.maybe_image_object_name;
  } else if (w2lTemplate?.maybe_video_object_name !== undefined && w2lTemplate?.maybe_video_object_name !== null) {
    object = w2lTemplate!.maybe_video_object_name;
  } else {
  }

  let url = `https://storage.googleapis.com/dev-vocodes-public${object}`;

  let audioFilename = '(select a file)';
  if (audioFile !== undefined) {
    audioFilename = audioFile?.name;
  }

  let modApprovalStatus = '';
  let defaultModValue = modApprovedFormValue ? "true" : "false";

  switch (w2lTemplate?.is_public_listing_approved) {
    case null:
      modApprovalStatus = 'Not yet (ask for approval in our Discord)';
      break;
    case true:
      modApprovalStatus = 'Approved';
      break;
    case false:
      modApprovalStatus = 'Not Approved';
      break;
  }

  let modOnlyApprovalForm = <span />;

  console.log('default mod value', defaultModValue);

  if (props.sessionWrapper.canApproveW2lTemplates()) {
    modOnlyApprovalForm = (
      <form onSubmit={handleModApprovalFormSubmit}>
        <label className="label">Mod Approval (sets public list visibility)</label>

        <div className="field is-grouped">
          <div className="control">

            <div className="select is-info is-large">
              <select name="approve" value={defaultModValue} onChange={handleModApprovalChange}>
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
    );
  }

  const currentlyDeleted = w2lTemplate?.deleted_at !== undefined && w2lTemplate.deleted_at !== null;

  let deletedAtRow = null;

  if (currentlyDeleted) {
    deletedAtRow = (
      <tr>
        <th>Deleted At (UTC)</th>
        <td>{w2lTemplate?.deleted_at}</td>
      </tr>
    );
  }

  let humanUseCount : string | number = 'Fetching...';

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  return (
    <div>
      <h1 className="title is-1"> Video lip sync template </h1>

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
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
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

      <h3 className="title is-3"> Template Details </h3>

      <img src={url} alt="template preview" />

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
              <Link to={creatorLink}>{w2lTemplate?.creator_display_name}</Link>
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
            <th>Is Public Listing Approved?</th>
            <td>{modApprovalStatus}</td>
          </tr>
          <tr>
            <th>Media Type</th>
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
            <th>Created At (UTC)</th>
            <td>{w2lTemplate?.created_at}</td>
          </tr>
          <tr>
            <th>Updated At (UTC)</th>
            <td>{w2lTemplate?.updated_at}</td>
          </tr>

          {deletedAtRow}

        </tbody>
      </table>

      {modOnlyApprovalForm}

      <W2lTemplateViewDeleteFc
        sessionWrapper={props.sessionWrapper}
        templateSlug={templateSlug}
        currentlyDeleted={currentlyDeleted}
        />

      <SessionW2lInferenceResultListFc w2lInferenceJobs={props.w2lInferenceJobs} />
      <br />
    </div>
  )
}

export { W2lTemplateViewFc };
