import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../../../common/ApiConfig';
import { SessionWrapper } from '../../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { GravatarFc } from '../../common/GravatarFc';
import { SpectrogramFc } from './SpectrogramFc';
import { ReportDiscordLinkFc } from '../../common/DiscordReportLinkFc';
import { BucketConfig } from '../../../common/BucketConfig';
import { FrontendUrlConfig } from '../../../common/FrontendUrlConfig';
import { HiddenIconFc } from '../../../icons/HiddenIconFc';
import { VisibleIconFc } from '../../../icons/VisibleIconFc';

interface TtsInferenceResultResponsePayload {
  success: boolean,
  result: TtsInferenceResult,
}

interface TtsInferenceResult {
  tts_result_token: string,

  tts_model_token: string,
  tts_model_title: string,

  raw_inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  maybe_creator_gravatar_hash?: string,

  maybe_model_creator_user_token?: string,
  maybe_model_creator_username?: string,
  maybe_model_creator_display_name?: string,
  maybe_model_creator_gravatar_hash?: string,

  public_bucket_wav_audio_path: string,
  public_bucket_spectrogram_path: string,

  creator_set_visibility?: string,

  file_size_bytes: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

  maybe_moderator_fields: TtsInferenceResultModeratorFields | null | undefined,
}

interface TtsInferenceResultModeratorFields {
  creator_ip_address: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsResultViewFc(props: Props) {
  let { token } : { token: string }= useParams();

  const [ttsInferenceResult, setTtsInferenceResult] = useState<TtsInferenceResult|undefined>(undefined);

  useEffect(() => {
    const api = new ApiConfig();
    const endpointUrl = api.viewTtsInferenceResult(token);

    fetch(endpointUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const modelsResponse : TtsInferenceResultResponsePayload = res;
      if (!modelsResponse.success) {
        return;
      }

      setTtsInferenceResult(modelsResponse.result)
    })
    .catch(e => {
      //this.props.onSpeakErrorCallback();
    });
  }, [token]); // NB: Empty array dependency sets to run ONLY on mount

  if (ttsInferenceResult === undefined) {
    return <div />;
  }

  let audioLink = new BucketConfig().getGcsUrl(ttsInferenceResult?.public_bucket_wav_audio_path);
  let modelLink = `/tts/${ttsInferenceResult.tts_model_token}`;

  // NB: Not respected in firefox: https://stackoverflow.com/a/28468261
  let audioDownloadFilename = `vocodes-${ttsInferenceResult.tts_model_token.replace(':', '')}.wav`;

  let spectrogramLink = new BucketConfig().getGcsUrl(ttsInferenceResult?.public_bucket_spectrogram_path);

  let durationSeconds = ttsInferenceResult?.duration_millis / 1000;

  let modelName = ttsInferenceResult.tts_model_title;

  //const currentlyDeleted = !!ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at || !!ttsInferenceResult?.maybe_moderator_fields?.user_deleted_at;

  let moderatorRows = null;

  if (props.sessionWrapper.canDeleteOtherUsersTtsResults() || props.sessionWrapper.canDeleteOtherUsersTtsModels()) {
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
          <td>{ttsInferenceResult?.maybe_moderator_fields?.creator_ip_address || "server error"}</td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>{ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at || "not deleted"}</td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>{ttsInferenceResult?.maybe_moderator_fields?.user_deleted_at || "not deleted"}</td>
        </tr>
      </>
    );
  }

  let creatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_creator_user_token) {
    let creatorLink = `/profile/${ttsInferenceResult.maybe_creator_username}`;
    creatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_creator_display_name || ""} 
          email_hash={ttsInferenceResult.maybe_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={creatorLink}>{ttsInferenceResult.maybe_creator_display_name}</Link>
      </span>
    );
  }

  let modelCreatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_model_creator_user_token) {
    let modelCreatorLink = `/profile/${ttsInferenceResult.maybe_model_creator_username}`;
    modelCreatorDetails = (
      <span>
        <GravatarFc 
          size={15}
          username={ttsInferenceResult.maybe_model_creator_display_name || ""} 
          email_hash={ttsInferenceResult.maybe_model_creator_gravatar_hash || ""} 
          />
        &nbsp;
        <Link to={modelCreatorLink}>{ttsInferenceResult.maybe_model_creator_display_name}</Link>
      </span>
    );
  }

  let resultVisibility = ttsInferenceResult?.creator_set_visibility === 'hidden' ? 
    <span>Hidden <HiddenIconFc /></span> :
    <span>Public <VisibleIconFc /></span> ;


  let headingTitle = 'TTS Result';
  let subtitle = <span />;
  if (ttsInferenceResult.tts_model_title !== undefined && ttsInferenceResult.tts_model_title !== null) {
    headingTitle = `${ttsInferenceResult.tts_model_title}`;
    subtitle = <h3 className="subtitle is-3"> TTS Result</h3>;
  }

  const currentlyDeleted = !!ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at || 
      !!ttsInferenceResult?.maybe_moderator_fields?.user_deleted_at;

  const deleteButtonTitle = currentlyDeleted ? "Undelete?" : "Delete?";

  const deleteButtonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  return (
    <div>
      <h1 className="title is-1"> {headingTitle} </h1>
      {subtitle}

      <audio
        controls
        src={audioLink}>
            Your browser does not support the
            <code>audio</code> element.
      </audio>

      <br />
      <br />

      <a className="button is-large is-primary is-fullwidth"
          href={audioLink}
          download={audioDownloadFilename}>Download File</a>

      <br />
      <br />


      <h4 className="subtitle is-4"> Spectrogram </h4>
      <SpectrogramFc spectrogramJsonLink={spectrogramLink} />

      <br />

      <table className="table is-fullwidth">
        <tbody>
          <tr>
            <td colSpan={2}>
              <h4 className="subtitle is-4"> Result Details </h4>
            </td>
          </tr>
          <tr>
            <th>Original text</th>
            <td>
              {ttsInferenceResult.raw_inference_text}
            </td>
          </tr>
          <tr>
            <th>Audio creator</th>
            <td>
              {creatorDetails}
            </td>
          </tr>
          <tr>
            <th>Audio duration</th>
            <td>{durationSeconds} seconds</td>
          </tr>
          <tr>
            <th>Visibility</th>
            <td>{resultVisibility}</td>
          </tr>
        </tbody>
        <tr>
          <td colSpan={2}>
            <br />
            <h4 className="subtitle is-4">Model Used</h4>
          </td>
        </tr>
        <tbody>
          <tr>
            <th>Model name</th>
            <td>
              <Link to={modelLink}>
                {modelName}
              </Link>
            </td>
          </tr>
          <tr>
            <th>Model creator</th>
            <td>
              {modelCreatorDetails}
            </td>
          </tr>
      
          {moderatorRows}

        </tbody>
      </table>
      

      <Link 
        className={deleteButtonCss}
        to={FrontendUrlConfig.ttsResultDeletePage(token)}
        >{deleteButtonTitle}</Link>

      <br />
      <ReportDiscordLinkFc />
    </div>
  )
}

export { TtsResultViewFc };
