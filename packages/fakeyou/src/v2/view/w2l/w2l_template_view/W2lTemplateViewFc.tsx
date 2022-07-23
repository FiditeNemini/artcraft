import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ApiConfig } from "@storyteller/components";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { W2lInferenceJob } from "../../../../App";
import { useParams, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { SessionW2lInferenceResultListFc } from "../../_common/SessionW2lInferenceResultsListFc";
import { ReportDiscordLinkFc } from "../../_common/DiscordReportLinkFc";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { VisibleIconFc } from "../../_icons/VisibleIcon";
import { HiddenIconFc } from "../../_icons/HiddenIcon";
import { FrontendUrlConfig } from "../../../../common/FrontendUrlConfig";
import {
  GetW2lTemplate,
  GetW2lTemplateIsErr,
  GetW2lTemplateIsOk,
  W2lTemplate,
  W2lTemplateLookupError,
} from "../../../api/w2l/GetW2lTemplate";
import { GetW2lTemplateUseCount } from "../../../api/w2l/GetW2lTemplateUseCount";
import { BackLink } from "../../_common/BackLink";

interface EnqueueJobResponsePayload {
  success: boolean;
  inference_job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  enqueueW2lJob: (jobToken: string) => void;
  w2lInferenceJobs: Array<W2lInferenceJob>;
}

function W2lTemplateViewFc(props: Props) {
  let { templateSlug }: { templateSlug: string } = useParams();

  // Ajax
  const [w2lTemplate, setW2lTemplate] = useState<W2lTemplate | undefined>(
    undefined
  );
  const [w2lTemplateUseCount, setW2lTemplateUseCount] = useState<
    number | undefined
  >(undefined);
  const [notFoundState, setNotFoundState] = useState<boolean>(false);

  // Inference
  const [audioFile, setAudioFile] = useState<File | undefined>(undefined);

  // Moderation
  const [modApprovedFormValue, setModApprovedFormValue] =
    useState<boolean>(true);

  const getTemplate = useCallback(
    async (templateSlug: string) => {
      const templateResponse = await GetW2lTemplate(templateSlug);

      if (GetW2lTemplateIsOk(templateResponse)) {
        setW2lTemplate(templateResponse);

        let modApprovalState = templateResponse?.is_public_listing_approved;

        if (modApprovedFormValue === undefined || modApprovalState === null) {
          modApprovalState = true;
        }

        setModApprovedFormValue(modApprovalState);
      } else if (GetW2lTemplateIsErr(templateResponse)) {
        switch (templateResponse) {
          case W2lTemplateLookupError.NotFound:
            setNotFoundState(true);
            break;
        }
      }
    },
    [modApprovedFormValue]
  );

  const getTemplateUseCount = useCallback(async (templateToken) => {
    const count = await GetW2lTemplateUseCount(templateToken);
    setW2lTemplateUseCount(count || 0);
  }, []);

  useEffect(() => {
    getTemplate(templateSlug);
    getTemplateUseCount(templateSlug);
  }, [templateSlug, getTemplate, getTemplateUseCount]);

  if (notFoundState) {
    return <h1 className="title is-1">Template not found</h1>;
  }

  if (!w2lTemplate) {
    return <div />;
  }

  const handleAudioFileChange = (fileList: FileList | null) => {
    if (fileList === null || fileList === undefined || fileList.length < 1) {
      setAudioFile(undefined);
    }

    let file = fileList![0];
    setAudioFile(file);
  };

  const handleInferenceFormSubmit = (
    ev: React.FormEvent<HTMLFormElement>
  ): boolean => {
    ev.preventDefault();

    if (audioFile === undefined) {
      return false;
    }

    if (w2lTemplate === undefined) {
      return false;
    }

    const templateToken = w2lTemplate!.template_token;

    let formData = new FormData();
    formData.append("audio", audioFile!);
    formData.append("template_token", templateToken);
    formData.append("uuid_idempotency_token", uuidv4()!);

    const api = new ApiConfig();
    const endpointUrl = api.inferW2l();

    // NB: Using 'axios' because 'fetch' was having problems with form-multipart
    // and then interpreting the resultant JSON. Maybe I didn't try hard enough?
    axios
      .post(endpointUrl, formData, { withCredentials: true })
      .then((res) => res.data)
      .then((res) => {
        console.log("w2l submitted");
        let response: EnqueueJobResponsePayload = res;
        if (!response.success || response.inference_job_token === undefined) {
          return;
        }
        console.log("w2l enqueueing");
        props.enqueueW2lJob(response.inference_job_token);
      });

    return false;
  };

  let object: string | undefined = undefined;

  if (
    w2lTemplate?.maybe_image_object_name !== undefined &&
    w2lTemplate?.maybe_image_object_name !== null
  ) {
    object = w2lTemplate!.maybe_image_object_name;
  } else if (
    w2lTemplate?.maybe_video_object_name !== undefined &&
    w2lTemplate?.maybe_video_object_name !== null
  ) {
    object = w2lTemplate!.maybe_video_object_name;
  } else {
  }

  let url = new BucketConfig().getGcsUrl(object);

  let audioFilename = "(select a file)";
  if (audioFile !== undefined) {
    audioFilename = audioFile?.name;
  }

  let modApprovalStatus = <span />;

  switch (w2lTemplate?.is_public_listing_approved) {
    case null:
      modApprovalStatus = (
        <span>
          Not yet (ask for approval in our&nbsp;
          <a
            href="https://discord.gg/H72KFXm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          )
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

  if (
    props.sessionWrapper.canDeleteOtherUsersW2lResults() ||
    props.sessionWrapper.canDeleteOtherUsersW2lTemplates()
  ) {
    moderatorRows = (
      <>
        <tr>
          <th>Creator is banned</th>
          <td>
            {w2lTemplate?.maybe_moderator_fields?.creator_is_banned
              ? "banned"
              : "good standing"}
          </td>
        </tr>
        <tr>
          <th>Create IP address</th>
          <td>
            {w2lTemplate?.maybe_moderator_fields?.creator_ip_address_creation ||
              "server error"}
          </td>
        </tr>
        <tr>
          <th>Update IP address</th>
          <td>
            {w2lTemplate?.maybe_moderator_fields
              ?.creator_ip_address_last_update || "server error"}
          </td>
        </tr>
        <tr>
          <th>Mod deleted at (UTC)</th>
          <td>
            {w2lTemplate?.maybe_moderator_fields?.mod_deleted_at ||
              "not deleted"}
          </td>
        </tr>
        <tr>
          <th>User deleted at (UTC)</th>
          <td>
            {w2lTemplate?.maybe_moderator_fields?.user_deleted_at ||
              "not deleted"}
          </td>
        </tr>
      </>
    );
  }

  let creatorLink = <span />;

  if (!!w2lTemplate?.creator_display_name) {
    const creatorUrl = FrontendUrlConfig.userProfilePage(
      w2lTemplate?.creator_username
    );
    creatorLink = (
      <span>
        <Gravatar
          size={15}
          username={w2lTemplate.creator_display_name || ""}
          email_hash={w2lTemplate.creator_gravatar_hash || ""}
        />
        &nbsp;
        <Link to={creatorUrl}>{w2lTemplate.creator_display_name}</Link>
      </span>
    );
  }

  let humanUseCount: string | number = "Fetching...";

  if (w2lTemplateUseCount !== undefined && w2lTemplateUseCount !== null) {
    humanUseCount = w2lTemplateUseCount;
  }

  let editButton = <span />;

  if (
    props.sessionWrapper.canEditTtsModelByUserToken(
      w2lTemplate?.creator_user_token
    )
  ) {
    editButton = (
      <>
        <Link
          className={"btn btn-secondary w-100"}
          to={FrontendUrlConfig.w2lTemplateEditPage(templateSlug)}
        >
          Edit Template Details
        </Link>
      </>
    );
  }

  let approveButton = <span />;

  if (props.sessionWrapper.canApproveW2lTemplates()) {
    const currentlyApproved = w2lTemplate?.is_public_listing_approved;

    const approveButtonTitle = currentlyApproved
      ? "Unapprove Template?"
      : "Approve Template?";

    const approveButtonCss = currentlyApproved
      ? "btn btn-primary w-100"
      : "btn btn-primary w-100";

    approveButton = (
      <>
        <Link
          className={approveButtonCss}
          to={FrontendUrlConfig.w2lTemplateApprovalPage(templateSlug)}
        >
          {approveButtonTitle}
        </Link>
      </>
    );
  }

  let deleteButton = <span />;

  if (
    props.sessionWrapper.canDeleteTtsModelByUserToken(
      w2lTemplate?.creator_user_token
    )
  ) {
    const currentlyDeleted =
      !!w2lTemplate?.maybe_moderator_fields?.mod_deleted_at ||
      !!w2lTemplate?.maybe_moderator_fields?.user_deleted_at;

    const deleteButtonTitle = currentlyDeleted
      ? "Undelete Template?"
      : "Delete Template?";

    const deleteButtonCss = currentlyDeleted
      ? "btn btn-secondary w-100"
      : "btn btn-destructive w-100";

    deleteButton = (
      <>
        <Link
          className={deleteButtonCss}
          to={FrontendUrlConfig.w2lTemplateDeletePage(templateSlug)}
        >
          {deleteButtonTitle}
        </Link>
      </>
    );
  }

  let templateDescription = null;

  if (!!w2lTemplate?.description_rendered_html) {
    templateDescription = (
      <>
        <div className="container-panel pt-3 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">Model Description</h2>
            <div className="py-6">
              <div
                className="profile content is-medium"
                dangerouslySetInnerHTML={{
                  __html: w2lTemplate?.description_rendered_html || "",
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  const resultVisibility =
    w2lTemplate?.creator_set_visibility === "hidden" ? (
      <span>
        Hidden <HiddenIconFc />
      </span>
    ) : (
      <span>
        Public <VisibleIconFc />
      </span>
    );

  return (
    <div>
      <div className="container py-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <h1 className="display-5 fw-bold">Video Lip Sync Template</h1>
          <h4>Template: {w2lTemplate?.title}</h4>
        </div>
        <div className="mt-3">
          <BackLink
            link={FrontendUrlConfig.w2lListPage()}
            text="Back to all templates"
          />
        </div>
      </div>

      <form onSubmit={handleInferenceFormSubmit}>
        <div className="container-panel pt-4 pb-5">
          <div className="panel p-3 p-lg-4">
            <h2 className="panel-title fw-bold">Upload Audio</h2>
            <div className="py-6">
              <div className="d-flex flex-column flex-lg-row gap-5">
                <div className="d-flex flex-column gap-4 w-100 w-lg-50">
                  <p>
                    Upload audio from FakeYou or any other source (eg. music),
                    then submit. You'll get a beautifully lipsynced video.
                  </p>
                  <div>
                    <label className="sub-title">Select an audio file</label>
                    <input
                      id="formFileLg"
                      type="file"
                      name="audio"
                      className="form-control form-control-lg"
                      onChange={(e) => handleAudioFileChange(e.target.files)}
                    />
                  </div>
                  <button className="btn btn-primary w-100 mt-3">Submit</button>
                </div>
                <div className="d-flex w-100 w-lg-50 justify-content-center">
                  <div className="template-preview ">
                    <img
                      src={url}
                      alt="template preview"
                      className="img-fluid rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {templateDescription}

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Template Details</h2>
          <div className="py-6">
            <table className="table">
              <tbody>
                <tr>
                  <th>Title</th>
                  <td>{w2lTemplate?.title}</td>
                </tr>
                <tr>
                  <th>Creator</th>
                  <td>{creatorLink}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Media Details</h2>
          <div className="py-6">
            <table className="table">
              <tbody>
                <tr>
                  <th>Media type</th>
                  <td>{w2lTemplate?.template_type}</td>
                </tr>
                <tr>
                  <th>Dimensions</th>
                  <td>
                    {w2lTemplate?.frame_width} x {w2lTemplate?.frame_height}
                  </td>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Moderator Details</h2>
          <div className="py-6">
            <table className="table">
              <tbody>{moderatorRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="d-flex flex-column flex-lg-row gap-3">
          {editButton}
          {approveButton}
          {deleteButton}
        </div>
      </div>

      <div className="container pt-4 pb-5">
        <ReportDiscordLinkFc />
      </div>

      <SessionW2lInferenceResultListFc
        w2lInferenceJobs={props.w2lInferenceJobs}
      />
    </div>
  );
}

export { W2lTemplateViewFc };
