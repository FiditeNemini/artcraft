import React, { useState, useEffect, useCallback } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { useParams, Link } from "react-router-dom";
import { SpectrogramImage } from "./SpectrogramImage";
import { ReportDiscordLinkFc } from "../../_common/DiscordReportLinkFc";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import { formatDistance } from "date-fns";
import {
  GetTtsResult,
  GetTtsResultIsErr,
  GetTtsResultIsOk,
  TtsResult,
  TtsResultLookupError,
} from "../../../api/tts/GetTtsResult";
import { TtsResultAudioPlayerFc } from "./TtsResultAudioPlayerFc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEdit,
  faTrash,
  faEye,
  faEyeSlash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { container, item, panel } from "../../../../data/animation";
import { Analytics } from "../../../../common/Analytics";
import {
  TwitterShareButton,
  FacebookShareButton,
  RedditShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  RedditIcon,
  WhatsappIcon,
} from "react-share";

interface Props {
  sessionWrapper: SessionWrapper;
}

function TtsResultViewPage(props: Props) {
  let { token }: { token: string } = useParams();

  const [ttsInferenceResult, setTtsInferenceResult] = useState<
    TtsResult | undefined
  >(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  const getTtsResult = useCallback(async (token) => {
    const result = await GetTtsResult(token);
    if (GetTtsResultIsOk(result)) {
      setTtsInferenceResult(result);
    } else if (GetTtsResultIsErr(result)) {
      switch (result) {
        case TtsResultLookupError.NotFound:
          setNotFoundState(true);
          break;
      }
    }
  }, []);

  const shareLink = `https://fakeyou.com${FrontendUrlConfig.ttsResultPage(
    token
  )}`;
  const shareTitle = `I just used FakeYou to generate speech as ${
    ttsInferenceResult?.tts_model_title || "one of my favorite characters"
  }!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    const copyBtn = document.getElementById("copyBtn");
    copyBtn!.innerHTML = "Copied!";
    setTimeout(() => (copyBtn!.innerHTML = "Copy"), 2000);
  };

  useEffect(() => {
    getTtsResult(token);
  }, [token, getTtsResult]); // NB: Empty array dependency sets to run ONLY on mount

  if (notFoundState) {
    return (
      <div className="container py-5">
        <div className="py-5">
          <h1 className="fw-semibold text-center mb-4">TTS result not found</h1>
          <div className="text-center">
            <Link className="btn btn-primary" to="/">
              Back to main
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ttsInferenceResult) {
    return <div />;
  }

  let audioLink = new BucketConfig().getGcsUrl(
    ttsInferenceResult?.public_bucket_wav_audio_path
  );
  let modelLink = `/tts/${ttsInferenceResult.tts_model_token}`;

  // NB: Not respected in firefox: https://stackoverflow.com/a/28468261
  let audioDownloadFilename = `fakeyou-${ttsInferenceResult.tts_model_token.replace(
    ":",
    ""
  )}.wav`;

  let spectrogramLink = new BucketConfig().getGcsUrl(
    ttsInferenceResult?.public_bucket_spectrogram_path
  );

  let durationSeconds = ttsInferenceResult?.duration_millis / 1000;

  let modelName = ttsInferenceResult.tts_model_title;

  let vocoderUsed = "unknown";
  switch (ttsInferenceResult?.maybe_pretrained_vocoder_used) {
    case "hifigan-superres":
      vocoderUsed = "HiFi-GAN";
      break;
    case "waveglow":
      vocoderUsed = "WaveGlow";
      break;
  }

  //const currentlyDeleted = !!ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at || !!ttsInferenceResult?.maybe_moderator_fields?.user_deleted_at;

  let debugRows = null;

  if (ttsInferenceResult?.is_debug_request) {
    debugRows = (
      <tr>
        <th>Was Debug Mode?</th>
        <td>true</td>
      </tr>
    );
  }

  let moderatorRows = null;

  if (
    props.sessionWrapper.canDeleteOtherUsersTtsResults() ||
    props.sessionWrapper.canDeleteOtherUsersTtsModels()
  ) {
    moderatorRows = (
      <>
        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">Moderator Details</h2>
            <div className="py-6">
              <table className="table">
                <tbody>
                  <tr>
                    <th>Model creator is banned</th>
                    <td>
                      {ttsInferenceResult?.maybe_moderator_fields
                        ?.model_creator_is_banned
                        ? "banned"
                        : "good standing"}
                    </td>
                  </tr>
                  <tr>
                    <th>Result creator is banned (if user)</th>
                    <td>
                      {ttsInferenceResult?.maybe_moderator_fields
                        ?.result_creator_is_banned_if_user
                        ? "banned"
                        : "good standing"}
                    </td>
                  </tr>
                  <tr>
                    <th>Result creator IP address</th>
                    <td>
                      {ttsInferenceResult?.maybe_moderator_fields
                        ?.result_creator_ip_address || "server error"}
                    </td>
                  </tr>
                  <tr>
                    <th>Mod deleted at (UTC)</th>
                    <td>
                      {ttsInferenceResult?.maybe_moderator_fields
                        ?.mod_deleted_at || "not deleted"}
                    </td>
                  </tr>
                  <tr>
                    <th>Result creator deleted at (UTC)</th>
                    <td>
                      {ttsInferenceResult?.maybe_moderator_fields
                        ?.result_creator_deleted_at || "not deleted"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  let creatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_creator_user_token) {
    let creatorLink = `/profile/${ttsInferenceResult.maybe_creator_username}`;
    creatorDetails = (
      <span>
        <Gravatar
          size={15}
          username={ttsInferenceResult.maybe_creator_display_name || ""}
          email_hash={ttsInferenceResult.maybe_creator_gravatar_hash || ""}
        />
        &nbsp;
        <Link to={creatorLink}>
          {ttsInferenceResult.maybe_creator_display_name}
        </Link>
      </span>
    );
  }

  let modelCreatorDetails = <span>Anonymous user</span>;
  if (!!ttsInferenceResult.maybe_model_creator_user_token) {
    let modelCreatorLink = `/profile/${ttsInferenceResult.maybe_model_creator_username}`;
    modelCreatorDetails = (
      <span>
        <Gravatar
          size={15}
          username={ttsInferenceResult.maybe_model_creator_display_name || ""}
          email_hash={
            ttsInferenceResult.maybe_model_creator_gravatar_hash || ""
          }
        />
        &nbsp;
        <Link to={modelCreatorLink}>
          {ttsInferenceResult.maybe_model_creator_display_name}
        </Link>
      </span>
    );
  }

  let resultVisibility =
    ttsInferenceResult?.creator_set_visibility === "hidden" ? (
      <span>
        Hidden <FontAwesomeIcon icon={faEyeSlash} />
      </span>
    ) : (
      <span>
        Public <FontAwesomeIcon icon={faEye} />
      </span>
    );

  let headingTitle = "TTS Result";
  let subtitle = <span />;
  if (
    ttsInferenceResult.tts_model_title !== undefined &&
    ttsInferenceResult.tts_model_title !== null
  ) {
    headingTitle = `${ttsInferenceResult.tts_model_title}`;
    subtitle = <h1 className="panel-title fw-bold">TTS Result</h1>;
  }

  const currentlyDeleted =
    !!ttsInferenceResult?.maybe_moderator_fields?.mod_deleted_at ||
    !!ttsInferenceResult?.maybe_moderator_fields?.result_creator_deleted_at;

  const deleteButtonTitle = currentlyDeleted
    ? "Undelete Result?"
    : "Delete Result?";

  const deleteButtonCss = currentlyDeleted
    ? "btn btn-primary w-100"
    : "btn btn-destructive w-100";

  let editButton = null;
  const canEdit = props.sessionWrapper.canEditTtsResultAsUserOrMod(
    ttsInferenceResult?.maybe_creator_user_token
  );

  if (canEdit) {
    editButton = (
      <>
        <Link
          className="btn btn-secondary w-100"
          to={FrontendUrlConfig.ttsResultEditPage(token)}
        >
          <FontAwesomeIcon icon={faEdit} className="me-2" />
          Edit Result Visibility
        </Link>
      </>
    );
  }

  let deleteButton = null;
  const canDelete = props.sessionWrapper.deleteTtsResultAsMod(
    ttsInferenceResult?.maybe_creator_user_token
  );

  if (canDelete) {
    deleteButton = (
      <>
        <Link
          className={deleteButtonCss}
          to={FrontendUrlConfig.ttsResultDeletePage(token)}
        >
          <FontAwesomeIcon icon={faTrash} className="me-2" />
          {deleteButtonTitle}
        </Link>
      </>
    );
  }

  const createdAt = new Date(ttsInferenceResult.created_at);
  const createdAtRelative = formatDistance(createdAt, new Date(), {
    addSuffix: true,
  });

  let downloadButton = null;

  if (props.sessionWrapper.isLoggedIn()) {
    downloadButton = (
      <>
        <a
          className=" btn btn-primary w-100 mt-4"
          href={audioLink}
          onClick={() => {
            Analytics.ttsResultPageClickDownload();
          }}
          download={audioDownloadFilename}
        >
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Download File{" "}
        </a>
      </>
    );
  } else {
    downloadButton = (
      <>
        <Link
          className=" btn btn-primary w-100 mt-4"
          to={FrontendUrlConfig.signupPage()}
          onClick={() => {
            Analytics.ttsResultPageClickRegisterToDownload();
          }}
        >
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Register Account to Download
        </Link>
      </>
    );
  }

  let socialSharing = (
    <>
      <div className="align-items-start panel p-3 p-lg-4">
        <h2 className="fw-bold panel-title">Share this audio</h2>

        <div className="py-6 d-flex gap-3 flex-column flex-lg-row align-items-center">
          <div className="d-flex gap-3">
            <TwitterShareButton
              title={shareTitle}
              url={shareLink}
              onClick={() => {
                Analytics.ttsResultPageClickShareTwitter();
              }}
            >
              <TwitterIcon size={42} round={true} className="share-icon" />
            </TwitterShareButton>
            <FacebookShareButton
              quote={shareTitle}
              url={shareLink}
              onClick={() => {
                Analytics.ttsResultPageClickShareFacebook();
              }}
            >
              <FacebookIcon size={42} round={true} className="share-icon" />
            </FacebookShareButton>
            <RedditShareButton
              title={shareTitle}
              url={shareLink}
              onClick={() => {
                Analytics.ttsResultPageClickShareReddit();
              }}
            >
              <RedditIcon size={42} round={true} className="share-icon" />
            </RedditShareButton>
            <WhatsappShareButton
              title={shareTitle}
              url={shareLink}
              onClick={() => {
                Analytics.ttsResultPageClickShareWhatsapp();
              }}
            >
              <WhatsappIcon size={42} round={true} className="share-icon" />
            </WhatsappShareButton>
          </div>
          <div className="d-flex copy-link w-100">
            <input
              id="resultLink"
              type="text"
              className="form-control"
              value={shareLink}
              readOnly
            ></input>
            <button
              onClick={handleCopyLink}
              id="copyBtn"
              type="button"
              className="btn btn-primary"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container py-5">
        <div className="d-flex flex-column">
          <motion.h1
            className="display-5 fw-bold mb-4 text-center text-lg-start"
            variants={item}
          >
            {headingTitle}
          </motion.h1>
        </div>
      </div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          {subtitle}
          <div className="py-6">
            <TtsResultAudioPlayerFc ttsResult={ttsInferenceResult} />
            {downloadButton}
          </div>
        </div>
      </motion.div>

      {/* Without wavesurfer, 
      <audio
        controls
        src={audioLink}>
            Your browser does not support the
            <code>audio</code> element.
      </audio>*/}

      <motion.div className="container-panel pt-3 pb-5" variants={item}>
        {socialSharing}
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Spectrogram</h2>
          <SpectrogramImage spectrogramJsonLink={spectrogramLink} />
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Result Details</h2>
          <div className="py-6">
            <table className="table tts-result-table">
              <tbody>
                <tr>
                  <th scope="row">Original text</th>
                  <td className="overflow-fix">
                    {ttsInferenceResult.raw_inference_text}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Audio creator</th>
                  <td>{creatorDetails}</td>
                </tr>
                <tr>
                  <th scope="row">Audio duration</th>
                  <td>{durationSeconds} seconds</td>
                </tr>
                <tr>
                  <th scope="row">Visibility</th>
                  <td>{resultVisibility}</td>
                </tr>
                <tr>
                  <th scope="row">Created (relative)</th>
                  <td>{createdAtRelative}</td>
                </tr>
                <tr>
                  <th scope="row">Created (UTC)</th>
                  <td>{ttsInferenceResult.created_at}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-3 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Model Used</h2>
          <div className="py-6">
            <table className="table tts-result-table">
              <tbody>
                <tr>
                  <th scope="row">Model name</th>
                  <td>
                    <Link to={modelLink}>{modelName}</Link>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Model creator</th>
                  <td>{modelCreatorDetails}</td>
                </tr>
                <tr>
                  <th scope="row">Vocoder used</th>
                  <td>{vocoderUsed}</td>
                </tr>
                <tr>
                  <th scope="row">Worker</th>
                  <td>{ttsInferenceResult.generated_by_worker}</td>
                </tr>

                {debugRows}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <motion.div variants={panel}>{moderatorRows}</motion.div>

      <motion.div className="container pb-5" variants={item}>
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">
          {editButton}
          {deleteButton}
        </div>
        <motion.p className="text-center text-lg-start" variants={item}>
          <ReportDiscordLinkFc />
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export { TtsResultViewPage };
