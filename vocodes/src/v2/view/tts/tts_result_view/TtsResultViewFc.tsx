import React, { useState, useEffect, useCallback } from 'react';
import { SessionWrapper } from '../../../../session/SessionWrapper';
import { useParams, Link } from 'react-router-dom';
import { GravatarFc } from '../../_common/GravatarFc';
import { SpectrogramFc } from './SpectrogramFc';
import { ReportDiscordLinkFc } from '../../_common/DiscordReportLinkFc';
import { BucketConfig } from '../../../../common/BucketConfig';
import { FrontendUrlConfig } from '../../../../common/FrontendUrlConfig';
import { HiddenIconFc } from '../../_icons/HiddenIcon';
import { VisibleIconFc } from '../../_icons/VisibleIcon';
import { GetTtsResult, TtsResult } from '../../../api/tts/GetTtsResult';
import { TtsResultAudioPlayerFc } from './TtsResultAudioPlayerFc';

interface Props {
  sessionWrapper: SessionWrapper,
}

function TtsResultViewFc(props: Props) {
  let { token } : { token: string }= useParams();

  const [ttsInferenceResult, setTtsInferenceResult] = useState<TtsResult|undefined>(undefined);

  const getTtsResult = useCallback(async (token) => {
    const result = await GetTtsResult(token);
    if (result) {
      setTtsInferenceResult(result);
    }
  }, []);

  useEffect(() => {
    getTtsResult(token);
  }, [token, getTtsResult]); // NB: Empty array dependency sets to run ONLY on mount

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

  let vocoderUsed = 'unknown';
  switch (ttsInferenceResult?.maybe_pretrained_vocoder_used) {
    case 'hifigan-superres':
      vocoderUsed = 'HiFi-GAN'
      break;
    case 'waveglow':
      vocoderUsed = 'WaveGlow'
      break;
  }

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

  const deleteButtonTitle = currentlyDeleted ? "Undelete Result?" : "Delete Result?";

  const deleteButtonCss = currentlyDeleted ? 
    "button is-warning is-large is-fullwidth" :
    "button is-danger is-large is-fullwidth";

  
  let editButton = null;
  const canEdit = props.sessionWrapper.canEditTtsResultAsUserOrMod(ttsInferenceResult?.maybe_creator_user_token);

  if (canEdit) {
    editButton = (
      <>
        <br />
        <Link 
          className="button is-info is-large is-fullwidth"
          to={FrontendUrlConfig.ttsResultEditPage(token)}
          >Edit Result Visibility</Link>
      </>
    );
  }

  let deleteButton = null;
  const canDelete = props.sessionWrapper.deleteTtsResultAsMod(ttsInferenceResult?.maybe_creator_user_token);

  if (canDelete) {
    deleteButton = (
      <>
        <br />
        <Link 
          className={deleteButtonCss}
          to={FrontendUrlConfig.ttsResultDeletePage(token)}
          >{deleteButtonTitle}</Link>
      </>
    );
  }

  return (
    <div>
      <h1 className="title is-1"> {headingTitle} </h1>
      {subtitle}

      <TtsResultAudioPlayerFc ttsResult={ttsInferenceResult} />

      {/* Without wavesurfer, 
      <audio
        controls
        src={audioLink}>
            Your browser does not support the
            <code>audio</code> element.
      </audio>*/}

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
          <tr>
            <th>Vocoder used</th>
            <td>{vocoderUsed}</td>
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

export { TtsResultViewFc };
