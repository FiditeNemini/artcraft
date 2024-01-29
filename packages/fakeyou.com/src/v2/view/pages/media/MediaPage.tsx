import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import MediaAudioComponent from "./MediaAudioComponent";
import MediaVideoComponent from "./MediaVideoComponent";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMediaFile";
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
  faLink,
  faFileCircleXmark,
  faArrowRightArrowLeft,
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
import { Input } from "components/common";
import LikeButton from "components/common/LikeButton";
import Badge from "components/common/Badge";
import useMediaFileTypeInfo from "hooks/useMediaFileTypeInfo";
import { useMedia, useRatings, useSession } from "hooks";
import SdCoverImagePanel from "../weight/cover_image_panels/SdCoverImagePanel";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";
import Iframe from "react-iframe";

export default function MediaPage() {
  const { user } = useSession();
  const { token } = useParams<{ token: string }>();
  const ratings = useRatings();
  const { media: mediaFile, status } = useMedia({
    mediaToken: token,
    onSuccess: (res: any) => {
      ratings.gather({ res, key: "token" });
    },
  });

  const timeCreated = moment(mediaFile?.created_at || "").fromNow();
  const dateCreated = moment(mediaFile?.created_at || "").format("LLL");
  const [buttonLabel, setButtonLabel] = useState("Copy");

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
        if (mediaFile.public_bucket_path) {
          sdMediaImage = bucketConfig.getGcsUrl(mediaFile.public_bucket_path);
        }
        return <SdCoverImagePanel src={sdMediaImage} />;
      case MediaFileType.BVH:
        const bvhUrl = bucketConfig.getGcsUrl(mediaFile.public_bucket_path);
        return (
          <Iframe
            {...{
              url: `https://engine.fakeyou.com?mode=viewer&bvh=${bvhUrl}`,
              className: "fy-studio-frame",
            }}
          />
        );
      case MediaFileType.GLTF:
        const gltfUrl = bucketConfig.getGcsUrl(mediaFile.public_bucket_path);
        return (
          <Iframe
            {...{
              url: `https://engine.fakeyou.com?mode=viewer&gltf=${gltfUrl}`,
              className: "fy-studio-frame",
            }}
          />
        );
      case MediaFileType.FBX:
        return (
          <Panel padding={true}>
            <div className="d-flex flex-column p-4 gap-3 text-center align-items-center">
              <FontAwesomeIcon
                icon={faFileCircleXmark}
                className="display-5 mb-2"
              />
              <h2 className="fw-semibold">FBX file not supported</h2>
              <div className="d-flex gap-2">
                <Button
                  icon={faArrowRightArrowLeft}
                  label="Convert FBX to glTF"
                  to="/fbx-to-gltf"
                  variant="primary"
                />
              </div>
            </div>
          </Panel>
        );
      default:
        return <div>Unsupported media type</div>;
    }
  }

  const mediaTypeInfo = useMediaFileTypeInfo(
    mediaFile?.media_type || MediaFileType.None
  );
  const { label: mediaType, color: mediaTagColor } = mediaTypeInfo;

  let audioLink = new BucketConfig().getGcsUrl(mediaFile?.public_bucket_path);

  const shareUrl = `https://fakeyou.com/media/${mediaFile?.token || ""}`;
  const shareText = "Check out this media on FakeYou.com!";

  if (status < 3)
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

  if (status === 4)
    // = error, will replace with type
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

  const weightCategoryMap: Record<WeightCategory, { weightCategory: string }> =
    {
      [WeightCategory.TTS]: { weightCategory: "Text to Speech" },
      [WeightCategory.VC]: { weightCategory: "Voice to Voice" },
      [WeightCategory.SD]: { weightCategory: "Image Generation" },
      [WeightCategory.ZS]: { weightCategory: "Voice Designer" },
      [WeightCategory.VOCODER]: { weightCategory: "Vocoder" },
    };

  let weightCategory = "none";
  if (mediaFile?.maybe_model_weight_info) {
    const categoryInfo =
      weightCategoryMap[mediaFile.maybe_model_weight_info.weight_category];
    weightCategory = categoryInfo ? categoryInfo.weightCategory : "none";
  }

  const audioDetails = [
    { property: "Type", value: mediaFile?.media_type || "" },
    { property: "Category", value: weightCategory || "" },
    { property: "Created at", value: dateCreated || "" },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
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
    { property: "Type", value: mediaFile?.media_type || "" },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
    },
    { property: "Created at", value: dateCreated || "" },
  ];

  const imageDetails = [
    { property: "Type", value: mediaFile?.media_type || "" },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
    },
    { property: "Created at", value: dateCreated || "" },
  ];

  const bvhDetails = [
    {
      property: "Type",
      value: mediaType || "",
    },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
    },
    { property: "Created at", value: dateCreated || "" },
  ];

  const gltfDetails = [
    {
      property: "Type",
      value: mediaType || "",
    },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
    },
    { property: "Created at", value: dateCreated || "" },
  ];

  const fbxDetails = [
    {
      property: "Type",
      value: mediaType || "",
    },
    {
      property: "Visibility",
      value: mediaFile?.creator_set_visibility.toString() || "",
    },
    { property: "Created at", value: dateCreated || "" },
  ];

  let mediaDetails;

  switch (mediaFile?.media_type) {
    case MediaFileType.Audio:
      mediaDetails = audioDetails;
      break;
    case MediaFileType.Video:
      mediaDetails = videoDetails;
      break;
    case MediaFileType.Image:
      mediaDetails = imageDetails;
      break;
    case MediaFileType.BVH:
      mediaDetails = bvhDetails;
      break;
    case MediaFileType.GLTF:
      mediaDetails = gltfDetails;
      break;
    case MediaFileType.FBX:
      mediaDetails = fbxDetails;
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

  if (user?.canBanUsers) {
    modMediaDetails = (
      <Accordion.Item title="Moderator Details" defaultOpen={false}>
        <DataTable data={modDetails} />
      </Accordion.Item>
    );
  }

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
  if (
    mediaFile?.maybe_model_weight_info !== null &&
    mediaFile?.maybe_model_weight_info?.maybe_cover_image_public_bucket_path !==
      null
  ) {
    weightUsedCoverImage = bucketConfig.getCdnUrl(
      mediaFile?.maybe_model_weight_info
        ?.maybe_cover_image_public_bucket_path || "",
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
                  {mediaFile?.maybe_model_weight_info?.title ||
                    `Media ${mediaType}`}
                </h1>
              </div>
              <div className="d-flex gap-3 flex-wrap align-items-center">
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <div>
                    <Badge label={mediaType} color={mediaTagColor} />
                  </div>
                  {subtitleDivider}

                  {mediaFile?.maybe_model_weight_info && (
                    <>
                      <p>{weightCategory}</p>
                      {subtitleDivider}
                    </>
                  )}

                  <div className="d-flex align-items-center gap-2">
                    <LikeButton
                      {...{
                        large: true,
                        ...ratings.makeProps({
                          entityToken: token,
                          entityType: "media_file",
                        }),
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
              {mediaFile && renderMediaComponent(mediaFile)}
            </div>

            <div className="panel p-3 py-4 p-md-4 mt-3 d-none d-xl-block">
              <h4 className="fw-semibold mb-3">Comments</h4>
              <CommentComponent
                entityType="media_file"
                entityToken={mediaFile?.token || ""}
              />
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="panel panel-clear d-flex flex-column gap-3">
              <div className="d-flex gap-2 flex-wrap">
                {mediaFile?.media_type === MediaFileType.Audio ? (
                  <Button
                    {...{
                      icon: faFaceViewfinder,
                      label: "Use audio in Face Animator",
                      to: `/face-animator/${mediaFile.token}`,
                      variant: "primary",
                      className: "flex-grow-1",
                    }}
                  />
                ) : null}

                {mediaFile?.media_type !== MediaFileType.Audio && (
                  <Button
                    icon={faArrowDownToLine}
                    label="Download"
                    className="flex-grow-1"
                    href={audioLink}
                    download={audioLink}
                    variant="secondary"
                  />
                )}
                {mediaFile?.media_type === MediaFileType.Audio && (
                  <div className="d-flex gap-2">
                    <Button
                      icon={faArrowDownToLine}
                      square={true}
                      variant="secondary"
                      href={audioLink}
                      download={audioLink}
                      tooltip="Download"
                    />
                  </div>
                )}
              </div>

              <Panel className="rounded">
                <div className="d-flex gap-2 p-3">
                  <Gravatar
                    size={48}
                    username={mediaFile?.maybe_creator_user?.username || ""}
                    email_hash={
                      mediaFile?.maybe_creator_user?.gravatar_hash || ""
                    }
                    avatarIndex={
                      mediaFile?.maybe_creator_user?.default_avatar
                        .image_index || 0
                    }
                    backgroundIndex={
                      mediaFile?.maybe_creator_user?.default_avatar
                        .color_index || 0
                    }
                  />
                  <div className="d-flex flex-column">
                    {mediaFile?.maybe_creator_user?.display_name ? (
                      <Link
                        className="fw-medium"
                        to={`/profile/${mediaFile?.maybe_creator_user?.display_name}`}
                      >
                        {mediaFile?.maybe_creator_user?.display_name}
                      </Link>
                    ) : (
                      <p className="fw-medium text-white">Anonymous</p>
                    )}

                    <p className="fs-7">Created {timeCreated}</p>
                  </div>
                </div>
              </Panel>

              {mediaFile?.maybe_model_weight_info && (
                <Panel className="rounded">
                  <div className="d-flex flex-column gap-2 p-3">
                    <div>
                      <h6 className="fw-medium mb-0">Weight Used</h6>
                      <hr className="mt-3 mb-2" />
                    </div>

                    <div className="d-flex align-items-center">
                      <WeightCoverImage
                        src={weightUsedCoverImage}
                        height={60}
                        width={60}
                      />
                      <div className="d-flex flex-column">
                        <Link
                          to={`/weight/${mediaFile?.maybe_model_weight_info.weight_token}`}
                        >
                          <h6 className="mb-1 two-line-ellipsis">
                            {mediaFile?.maybe_model_weight_info.title}
                          </h6>
                        </Link>
                        <p className="fs-7">
                          by{" "}
                          <Link
                            to={`/profile/${mediaFile?.maybe_model_weight_info.maybe_weight_creator.username}`}
                            className="fw-medium text-white"
                          >
                            {
                              mediaFile?.maybe_model_weight_info
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
                  {!!mediaDetails && (
                    <DataTable
                      {...{
                        data: mediaDetails,
                      }}
                    />
                  )}
                </Accordion.Item>

                {modMediaDetails}
              </Accordion>

              <Panel className="p-3 rounded">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <h6 className="fw-medium mb-0">Share Media</h6>
                    <hr className="mt-3 mb-0" />
                  </div>

                  <div className="d-flex justify-content-between flex-wrap">
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
              </Panel>
            </div>
          </div>
        </div>
      </Container>

      <div className="d-xl-none my-3">
        <Container type="panel">
          <Panel padding={true}>
            <h4 className="fw-semibold mb-3">Comments</h4>
            <CommentComponent
              entityType="media_file"
              entityToken={mediaFile?.token || ""}
            />
          </Panel>
        </Container>
      </div>
    </div>
  );
}
