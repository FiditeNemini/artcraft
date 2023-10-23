import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MediaAudioComponent from "./MediaAudioComponent";
import MediaVideoComponent from "./MediaVideoComponent";
import MediaImageComponent from "./MediaImageComponent";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  GetMediaFile,
  MediaFile,
} from "@storyteller/components/src/api/media_files/GetMediaFile";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Skeleton from "components/common/Skeleton";
import Button from "components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faArrowDownToLine,
  // faCirclePlay,
  // faShare,
  faSquareQuote,
} from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import useTimeAgo from "hooks/useTimeAgo";
import { CommentComponent } from "v2/view/_common/comments/CommentComponent";
import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

interface MediaPageProps {
  sessionWrapper: SessionWrapper;
}

export default function MediaPage({ sessionWrapper }: MediaPageProps) {
  const { token } = useParams<{ token: string }>();
  const [mediaFile, setMediaFile] = useState<MediaFile | undefined | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const timeCreated = useTimeAgo(mediaFile?.created_at.toISOString() || "");

  const getMediaFile = useCallback(async (mediaFileToken: string) => {
    let result = await GetMediaFile(mediaFileToken);
    if (result.media_file) {
      setMediaFile(result.media_file);
      setIsLoading(false);
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getMediaFile(token);
  }, [token, getMediaFile]);

  function renderMediaComponent(mediaFile: MediaFile) {
    switch (mediaFile.media_type) {
      case MediaFileType.Audio:
        return (
          <div className="panel p-3 p-lg-4 d-flex flex-column">
            {/* Voice model name that is used to generate the audio */}
            {/*<h3 className="fw-bold mb-4">[Voice Model Name]</h3> */}

            <MediaAudioComponent mediaFile={mediaFile} />

            {/* Show TTS text input if it is a TTS result */}
            {mediaFile.public_bucket_path.includes("tts_inference_output") && (
              <div className="mt-4">
                <h5 className="fw-semibold">
                  <FontAwesomeIcon icon={faSquareQuote} className="me-2" />
                  Audio Text
                </h5>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Pellentesque elit ullamcorper dignissim cras tincidunt
                  lobortis. Integer malesuada nunc vel risus commodo viverra
                  maecenas accumsan lacus.
                </p>
              </div>
            )}
          </div>
        );
      case MediaFileType.Video:
        return (
          <>
            <div className="panel panel-clear">
              <div className="ratio ratio-16x9 video-bg panel-border rounded">
                <MediaVideoComponent mediaFile={mediaFile} />
              </div>
            </div>
          </>
        );

      case MediaFileType.Image:
        return <MediaImageComponent mediaFile={mediaFile} />;
      default:
        return <div>Unsupported media type</div>;
    }
  }

  let audioLink = new BucketConfig().getGcsUrl(mediaFile?.public_bucket_path);

  if (isLoading)
    return (
      <>
        <Container type="padded" className="pt-4 pt-lg-5">
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <div className="panel p-3 py-4 p-md-4">
                <h1 className="mb-0">
                  <Skeleton />
                </h1>
              </div>

              <div className="panel p-3 py-4 p-md-4 mt-4 d-none d-xl-block">
                <h4 className="fw-semibold mb-3">
                  <Skeleton type="short" />
                </h4>
                <h1>
                  <Skeleton />
                </h1>
              </div>
            </div>
            <div className="col-12 col-xl-4 d-flex flex-column gap-2">
              <h1 className="mb-0">
                <Skeleton type="medium" />
              </h1>
              <h1 className="mb-0">
                <Skeleton />
              </h1>
              <h1 className="mb-0">
                <Skeleton />
              </h1>
            </div>
          </div>
        </Container>

        <div className="d-xl-none mt-4">
          <Panel padding>
            <h4 className="fw-semibold mb-3">
              <Skeleton type="short" />
            </h4>
            <h1 className="mb-0">
              <Skeleton />
            </h1>
          </Panel>
        </div>
      </>
    );

  if (error || !mediaFile)
    return (
      <Container type="panel">
        <PageHeader
          titleIcon={faCircleExclamation}
          title="Media not found"
          subText="This media does not exist or is private."
          extension={
            <div className="d-flex">
              <Button label="Back to homepage" to="/" className="d-flex" />
            </div>
          }
        />
      </Container>
    );

  const audioDetails = [
    { property: "Type", value: mediaFile.media_type },
    { property: "Created at", value: mediaFile.created_at.toString() },
    {
      property: "Visibility",
      value: mediaFile.creator_set_visibility.toString(),
    },
    /*{
      property: "Model",
      value: mediaFile.model_used,
      link: mediaFile.model_link,
    },
    {
      property: "Vocoder",
      value: "Test",
    },
    {
      property: "Language",
      value: "English",
    },
    {
      property: "Model",
      value: mediaFile.model_used,
    },*/
  ];

  const videoDetails = [
    { property: "Type", value: mediaFile.media_type },
    { property: "Created at", value: mediaFile.created_at.toString() },
    {
      property: "Visibility",
      value: mediaFile.creator_set_visibility.toString(),
    },
  ];

  const imageDetails = [
    { property: "Type", value: mediaFile.media_type },
    { property: "Created at", value: mediaFile.created_at.toString() },
    {
      property: "Visibility",
      value: mediaFile.creator_set_visibility.toString(),
    },
  ];

  let mediaDetails = undefined;

  switch (mediaFile.media_type) {
    case MediaFileType.Audio:
      mediaDetails = <DataTable data={audioDetails} />;
      break;
    case MediaFileType.Video:
      mediaDetails = <DataTable data={videoDetails} />;
      break;
    case MediaFileType.Image:
      mediaDetails = <DataTable data={imageDetails} />;
      break;
    default:
  }

  let modMediaDetails = undefined;

  const modDetails = [
    { property: "Model creator is banned", value: "good standing" },
    {
      property: "Result creator is banned (if user)",
      value: "good standing",
    },
    {
      property: "Result creator IP address",
      value: "0.0.0.0",
    },
    {
      property: "Mod deleted at (UTC)",
      value: "not deleted",
    },
    {
      property: "Result creator deleted at (UTC)",
      value: "not deleted",
    },
  ];

  if (sessionWrapper.canBanUsers()) {
    modMediaDetails = (
      <Accordion.Item title="Moderator Details" defaultOpen={false}>
        <DataTable data={modDetails} />
      </Accordion.Item>
    );
  }

  return (
    <div>
      <Container type="panel" className="pt-4 pt-lg-5">
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="media-wrapper">
              {renderMediaComponent(mediaFile)}
            </div>

            <div className="panel p-3 py-4 p-md-4 mt-4 d-none d-xl-block">
              <h4 className="fw-semibold mb-3">Comments</h4>
              <CommentComponent
                entityType="user"
                entityToken={mediaFile.token}
                sessionWrapper={sessionWrapper}
              />
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="panel panel-clear d-flex flex-column gap-4">
              <div className="d-flex gap-2">
                <Gravatar
                  size={48}
                  username={mediaFile.maybe_creator_user?.display_name}
                  avatarIndex={
                    mediaFile.maybe_creator_user?.default_avatar.image_index
                  }
                  backgroundIndex={
                    mediaFile.maybe_creator_user?.default_avatar.color_index
                  }
                />
                <div className="d-flex flex-column">
                  <Link
                    className="fw-medium"
                    to={`/profile/${mediaFile.maybe_creator_user?.display_name}`}
                  >
                    {mediaFile.maybe_creator_user?.display_name}
                  </Link>
                  {timeCreated}
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Button
                  icon={faArrowDownToLine}
                  label="Download"
                  className="flex-grow-1"
                  href={audioLink}
                  download={audioLink}
                />
                {/* Share and Create Buttons */}
                {/* <div className="d-flex gap-2">
                  <Button
                    square={true}
                    variant="secondary"
                    icon={faCirclePlay}
                    onClick={() => {}}
                    tooltip="Create"
                  />
                  <Button
                    square={true}
                    variant="secondary"
                    icon={faShare}
                    onClick={() => {}}
                    tooltip="Share"
                  />
                </div> */}
              </div>

              <Accordion>
                <Accordion.Item title="Media Details" defaultOpen={true}>
                  {mediaDetails}
                </Accordion.Item>

                {modMediaDetails}
              </Accordion>
            </div>
          </div>
        </div>
      </Container>

      <div className="d-xl-none my-4">
        <Container type="panel">
          <Panel padding={true}>
            <h4 className="fw-semibold mb-3">Comments</h4>
            <CommentComponent
              entityType="user"
              entityToken={mediaFile.token}
              sessionWrapper={sessionWrapper}
            />
          </Panel>
        </Container>
      </div>
    </div>
  );
}
