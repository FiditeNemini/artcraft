import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MediaAudioComponent from "./MediaAudioComponent";
import MediaVideoComponent from "./MediaVideoComponent";
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
  faFaceViewfinder,
  faArrowDownToLine,
  faSquareQuote,
  faShare,
  faLink,
} from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { CommentComponent } from "v2/view/_common/comments/CommentComponent";
import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import moment from "moment";
import WeightCoverImage from "components/common/WeightCoverImage";
import SocialButton from "components/common/SocialButton";
import Modal from "components/common/Modal";
import { Input } from "components/common";
import LikeButton from "components/common/LikeButton";
import Badge from "components/common/Badge";
import useMediaFileTypeInfo from "hooks/useMediaFileTypeInfo";
import { useBookmarks } from "hooks";
import SdCoverImagePanel from "../weight/cover_image_panels/SdCoverImagePanel";

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
  const timeCreated = moment(mediaFile?.created_at || "").fromNow();
  const dateCreated = moment(mediaFile?.created_at || "").format("LLL");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Copy");

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

  const bookmarks = useBookmarks();

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
        let sdMediaImage = "/images/avatars/default-pfp.png";
        if (
          mediaFile.maybe_model_weight_info &&
          mediaFile.maybe_model_weight_info
            .maybe_cover_image_public_bucket_path !== null
        ) {
          sdMediaImage = bucketConfig.getGcsUrl(
            mediaFile.maybe_model_weight_info
              .maybe_cover_image_public_bucket_path
          );
        }
        return <SdCoverImagePanel src={sdMediaImage} />;
      default:
        return <div>Unsupported media type</div>;
    }
  }

  const weightTypeInfo = useMediaFileTypeInfo(
    mediaFile?.media_type || MediaFileType.None
  );
  const { label: mediaType, color: mediaTagColor } = weightTypeInfo;

  let audioLink = new BucketConfig().getGcsUrl(mediaFile?.public_bucket_path);

  const shareUrl = `https://fakeyou.com/media/${mediaFile?.token || ""}`;
  const shareText = "Check out this media on FakeYou.com!";

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
    { property: "Created at", value: dateCreated || "" },
    {
      property: "Visibility",
      value: mediaFile.creator_set_visibility.toString(),
    },
    /*{
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
    { property: "Created at", value: dateCreated || "" },
    {
      property: "Visibility",
      value: mediaFile.creator_set_visibility.toString(),
    },
  ];

  const imageDetails = [
    { property: "Type", value: mediaFile.media_type },
    { property: "Created at", value: dateCreated || "" },
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

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setButtonLabel("Copied!");
    setTimeout(() => setButtonLabel("Copy"), 1000);
  };

  const subtitleDivider = <span className="opacity-25 fs-5 fw-light">|</span>;

  const bucketConfig = new BucketConfig();

  let weightUsedCoverImage = "/images/avatars/default-pfp.png";
  if (mediaFile.maybe_model_weight_info !== null) {
    weightUsedCoverImage = bucketConfig.getCdnUrl(
      mediaFile.maybe_model_weight_info.maybe_cover_image_public_bucket_path,
      60,
      100
    );
  }

  return (
    <div>
      <Container type="panel" className="mb-5">
        <Panel clear={true} className="py-4">
          <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-2">
            <div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <h1 className="fw-bold mb-2">
                  {mediaFile.maybe_model_weight_info?.title ||
                    `Media ${mediaType}`}
                </h1>
              </div>
              <div className="d-flex gap-3 flex-wrap align-items-center">
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <div>
                    <Badge label={mediaType} color={mediaTagColor} />
                  </div>
                  {subtitleDivider}

                  {mediaFile.maybe_model_weight_info && (
                    <>
                      <p>
                        {mediaFile.maybe_model_weight_info?.weight_category}
                      </p>
                      {subtitleDivider}
                    </>
                  )}

                  <div className="d-flex align-items-center gap-2">
                    <LikeButton
                      {...{
                        entityToken: token,
                        entityType: "media_file",
                        likeCount: 1200,
                        onToggle: bookmarks.toggle,
                        large: true,
                      }}
                    />
                    {/* <BookmarkButton
                        {...{
                          entityToken: weight_token,
                          entityType: "model_weight",
                          onToggle: bookmarks.toggle,
                          large: true,
                        }}
                      /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="media-wrapper">
              {renderMediaComponent(mediaFile)}
            </div>

            <div className="panel p-3 py-4 p-md-4 mt-3 d-none d-xl-block">
              <h4 className="fw-semibold mb-3">Comments</h4>
              <CommentComponent
                entityType="user"
                entityToken={mediaFile.token}
                sessionWrapper={sessionWrapper}
              />
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="panel panel-clear d-flex flex-column gap-3">
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  icon={faArrowDownToLine}
                  label="Download"
                  className="flex-grow-1"
                  href={audioLink}
                  download={audioLink}
                />

                <div className="d-flex gap-2">
                  {/* <Button
                    square={true}
                    variant="secondary"
                    // icon={faCirclePlay}
                    onClick={() => {}}
                    tooltip="Create"
                  /> */}

                  <Button
                    icon={faShare}
                    square={true}
                    variant="secondary"
                    tooltip="Share"
                    onClick={openShareModal}
                  />
                </div>
              </div>

              {mediaFile.media_type === MediaFileType.Audio ? (
                <Button
                  {...{
                    icon: faFaceViewfinder,
                    label: "Use audio in Face Animator",
                    to: `/face-animator/${mediaFile.token}`,
                    variant: "secondary",
                  }}
                />
              ) : null}

              <Panel className="rounded">
                <div className="d-flex gap-2 p-3">
                  <Gravatar
                    size={48}
                    username={mediaFile.maybe_creator_user?.username || ""}
                    email_hash={
                      mediaFile.maybe_creator_user?.gravatar_hash || ""
                    }
                    avatarIndex={
                      mediaFile.maybe_creator_user?.default_avatar
                        .image_index || 0
                    }
                    backgroundIndex={
                      mediaFile.maybe_creator_user?.default_avatar
                        .color_index || 0
                    }
                  />
                  <div className="d-flex flex-column">
                    {mediaFile.maybe_creator_user?.display_name ? (
                      <Link
                        className="fw-medium"
                        to={`/profile/${mediaFile.maybe_creator_user?.display_name}`}
                      >
                        {mediaFile.maybe_creator_user?.display_name}
                      </Link>
                    ) : (
                      <p className="fw-medium text-white">Anonymous</p>
                    )}

                    <p className="fs-7">Created {timeCreated}</p>
                  </div>
                </div>
              </Panel>

              {mediaFile.maybe_model_weight_info && (
                <Panel className="rounded">
                  <div className="d-flex flex-column gap-2 p-3">
                    <h6 className="fw-medium mb-0">Weight Used</h6>
                    <hr className="my-1" />
                    <div className="d-flex align-items-center">
                      <WeightCoverImage
                        src={weightUsedCoverImage}
                        height={60}
                        width={60}
                      />
                      <div className="d-flex flex-column">
                        <Link
                          to={`/weight/${mediaFile.maybe_model_weight_info.weight_token}`}
                        >
                          <h6 className="mb-1">
                            {mediaFile.maybe_model_weight_info.title}
                          </h6>
                        </Link>
                        <p className="fs-7">
                          by{" "}
                          <Link
                            to={`/profile/${mediaFile.maybe_model_weight_info.maybe_weight_creator.username}`}
                          >
                            {
                              mediaFile.maybe_model_weight_info
                                .maybe_weight_creator.display_name
                            }
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              )}

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

      <div className="d-xl-none my-3">
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

      {/* Share Modal */}
      <Modal
        show={isShareModalOpen}
        handleClose={closeShareModal}
        title="Share"
        autoWidth={true}
        showButtons={false}
        content={
          <div className="d-flex flex-column gap-4">
            <div className="d-flex gap-3">
              <SocialButton
                social="x"
                shareUrl={shareUrl}
                shareText={shareText}
              />
              <SocialButton
                social="whatsapp"
                shareUrl={shareUrl}
                shareText={shareText}
              />
              <SocialButton
                social="facebook"
                shareUrl={shareUrl}
                shareText={shareText}
              />
              <SocialButton
                social="reddit"
                shareUrl={shareUrl}
                shareText={shareText}
              />
              <SocialButton
                social="email"
                shareUrl={shareUrl}
                shareText={shareText}
              />
            </div>
            <div className="d-flex gap-2">
              <div className="flex-grow-1">
                <Input type="text" value={shareUrl} readOnly />
              </div>

              <Button
                icon={faLink}
                label={buttonLabel}
                onClick={handleCopyLink}
                variant="primary"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
