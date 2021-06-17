import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { GravatarFc } from '../../common/GravatarFc';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { W2lResultViewDeleteFc } from './W2lResultView_DeleteFc';

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

  file_size_bytes: number,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

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

  let videoLink = `https://storage.googleapis.com/dev-vocodes-public${w2lInferenceResult?.public_bucket_video_path}`; 
  let templateLink = `/w2l/${w2lInferenceResult.maybe_w2l_template_token}`;
  let videoDownloadFilename = `vocodes-${w2lInferenceResult.w2l_result_token.replace(':', '')}.mp4`;

  let durationSeconds = w2lInferenceResult?.duration_millis / 1000;

  let templateName = w2lInferenceResult.template_title;

  const currentlyDeleted = !!w2lInferenceResult?.mod_deleted_at || !!w2lInferenceResult?.user_deleted_at;

  let deletedAtRows = null;

  if (currentlyDeleted) {
    deletedAtRows = (
      <>
        <tr>
          <th>Mod Deleted At (UTC)</th>
          <td>{w2lInferenceResult?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User Deleted At (UTC)</th>
          <td>{w2lInferenceResult?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }


  if (w2lInferenceResult.template_title.length < 5) {
    templateName = `Template: ${w2lInferenceResult.template_title}`;
  }

  let creatorDetails = <span>Anonymous user</span>;
  if (w2lInferenceResult.maybe_creator_user_token !== undefined) {
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
  if (w2lInferenceResult.maybe_template_creator_user_token !== undefined) {
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

  return (
    <div>
      <h1 className="title is-1"> Lipsync Result </h1>

      <video width="80%" height="auto" controls={true}>
        <source src={videoLink} />
        Your device doesn't support video.
      </video> 

      <br />
      <br />

      <a className="button is-medium is-primary" 
          href={videoLink}
          download={videoDownloadFilename}>Download File</a>


      <br />
      <br />

      <h4 className="title is-4"> Details </h4>

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
              {creatorDetails}
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
          <tr>
            <th>Duration</th>
            <td>{durationSeconds} seconds</td>
          </tr>

          {deletedAtRows}

        </tbody>
      </table>

      <W2lResultViewDeleteFc
        sessionWrapper={props.sessionWrapper}
        resultToken={token}
        currentlyDeleted={currentlyDeleted}
        maybeCreatorUserToken={w2lInferenceResult?.maybe_creator_user_token}
        />

    </div>
  )
}

export { W2lResultViewFc };
