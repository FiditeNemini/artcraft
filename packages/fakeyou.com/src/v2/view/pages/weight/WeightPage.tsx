import React, { useState } from "react";
import { Link, useHistory, useParams, useLocation } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Skeleton from "components/common/Skeleton";
import Button from "components/common/Button";
import { faCircleExclamation, faLink } from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { CommentComponent } from "v2/view/_common/comments/CommentComponent";
import { WeightType } from "@storyteller/components/src/api/_common/enums/WeightType";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import Badge from "components/common/Badge";
import BookmarkButton from "components/common/BookmarkButton";
import LikeButton from "components/common/LikeButton";
import VdInferencePanel from "./inference_panels/VdInferencePanel";
import VcInferencePanel from "./inference_panels/VcInferencePanel";
import TtsInferencePanel from "./inference_panels/TtsInferencePanel";
import Modal from "components/common/Modal";
import SocialButton from "components/common/SocialButton";
import Input from "components/common/Input";
import { useBookmarks, useWeightFetch, useRatings } from "hooks";
import useWeightTypeInfo from "hooks/useWeightTypeInfo/useWeightTypeInfo";
import moment from "moment";
import WeightCoverImage from "components/common/WeightCoverImage";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import SdInferencePanel from "./inference_panels/SdInferencePanel";
import SdCoverImagePanel from "./cover_image_panels/SdCoverImagePanel";

interface WeightProps {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobs: Array<InferenceJob>;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  enqueueTtsJob: (jobToken: string) => void;
}

export default function WeightPage({
  sessionWrapper,
  sessionSubscriptionsWrapper,
  inferenceJobs,
  ttsInferenceJobs,
  enqueueInferenceJob,
  enqueueTtsJob,
  inferenceJobsByCategory,
}: WeightProps) {
  const { search } = useLocation();
  const { weight_token } = useParams<{ weight_token: string }>();
  const origin = search ? new URLSearchParams(search).get("origin") : "";
  const history = useHistory();
  const bookmarks = useBookmarks();
  const ratings = useRatings();
  const {
    data: weight,
    descriptionMD,
    fetchError,
    isLoading,
    title,
    remove,
  } = useWeightFetch({
    onRemove: () => {
      history.push(origin || "");
    },
    onSuccess: (res: any) => {
      bookmarks.gather({ res, key: "weight_token" }); // expand rather than replace for lazy loading
      ratings.gather({ res, key: "weight_token" });
    },
    token: weight_token,
  });

  const timeUpdated = moment(weight?.updated_at || "").fromNow();
  const dateUpdated = moment(weight?.updated_at || "").format("LLL");
  const dateCreated = moment(weight?.updated_at || "").format("LLL");
  const [buttonLabel, setButtonLabel] = useState("Copy");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const bucketConfig = new BucketConfig();

  const weightTypeInfo = useWeightTypeInfo(
    weight?.weight_type || WeightType.NONE
  );
  const {
    label: weightType,
    color: weightTagColor,
    fullLabel: weightTypeFull,
  } = weightTypeInfo;

  function renderWeightComponent(weight: Weight) {
    switch (weight.weight_category) {
      case WeightCategory.TTS:
        return (
          <TtsInferencePanel
            inferenceJobs={inferenceJobs}
            sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
            enqueueInferenceJob={enqueueInferenceJob}
            inferenceJobsByCategory={inferenceJobsByCategory}
            ttsInferenceJobs={ttsInferenceJobs}
            enqueueTtsJob={enqueueTtsJob}
            voiceToken={weight.weight_token}
          />
        );
      case WeightCategory.VC:
        return (
          <VcInferencePanel
            sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
            enqueueInferenceJob={enqueueInferenceJob}
            inferenceJobs={inferenceJobs}
            inferenceJobsByCategory={inferenceJobsByCategory}
            voiceToken={weight.weight_token}
          />
        );

      case WeightCategory.ZS:
        return (
          <VdInferencePanel
            inferenceJobs={inferenceJobs}
            sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
            enqueueInferenceJob={enqueueInferenceJob}
            inferenceJobsByCategory={inferenceJobsByCategory}
            ttsInferenceJobs={ttsInferenceJobs}
            voiceToken={weight.weight_token}
          />
        );
      case WeightCategory.SD:
        let sdCoverImage = "/images/avatars/default-pfp.png";
        if (
          weight?.cover_image?.maybe_cover_image_public_bucket_path !== null
        ) {
          sdCoverImage = bucketConfig.getGcsUrl(
            weight?.cover_image?.maybe_cover_image_public_bucket_path || ""
          );
        }

        return (
          <div className="d-flex flex-column gap-3">
            <SdCoverImagePanel src={sdCoverImage} />
            <SdInferencePanel
              sd_model_token={weight.weight_token}
              enqueueInferenceJob={enqueueInferenceJob}
            />
          </div>
        );
      default:
        return null;
    }
  }

  //Loading state
  if (isLoading)
    return (
      <>
        <Container type="padded" className="pt-4 pt-lg-5">
          <div className="row g-4">
            <div className="col-12 col-xl-8">
              <h1 className="mb-0">
                <Skeleton />
              </h1>

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

  //Error state
  if (fetchError || !weight)
    return (
      <Container type="panel">
        <PageHeader
          titleIcon={faCircleExclamation}
          title="Media not found"
          subText="This media does not exist or is private."
          panel={true}
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

  let { weightCategory } = weightCategoryMap[weight.weight_category] || {
    weightCategory: "none",
  };

  const voiceDetails = [
    { property: "Type", value: weightTypeFull || WeightType.NONE },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility,
    },
    { property: "Created at", value: dateCreated || "" },
    { property: "Updated at", value: dateUpdated || "" },
  ];

  const imageDetails = [
    { property: "Type", value: weightTypeFull || WeightType.NONE },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility,
    },
    { property: "Created at", value: dateCreated || "" },
    { property: "Updated at", value: dateUpdated || "" },

    //more to add for image/stable diffusion details
  ];

  let weightDetails = undefined;

  switch (weight.weight_category) {
    case WeightCategory.TTS:
      weightDetails = <DataTable data={voiceDetails} />;
      break;
    case WeightCategory.VC:
      weightDetails = <DataTable data={voiceDetails} />;
      break;
    case WeightCategory.ZS:
      weightDetails = <DataTable data={voiceDetails} />;
      break;
    case WeightCategory.SD:
      weightDetails = <DataTable data={imageDetails} />;
      break;
    default:
  }

  let modMediaDetails = undefined;

  //dummy content
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

  // const handleBookmark = () => {
  //   return bookmarks.toggle(); // this function checks if the bookmark exists, truthy = deleted, falsy = created
  // };

  const subtitleDivider = <span className="opacity-25 fs-5 fw-light">|</span>;

  const shareUrl = `https://fakeyou.com/weight/${weight.weight_token}`;
  const shareText = `Use FakeYou to generate speech as ${
    title || "your favorite characters"
  }!`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setButtonLabel("Copied!");
    setTimeout(() => setButtonLabel("Copy"), 1000);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  let audioWeightCoverImage = undefined;
  if (weight?.cover_image?.maybe_cover_image_public_bucket_path !== null) {
    audioWeightCoverImage = bucketConfig.getCdnUrl(
      weight?.cover_image?.maybe_cover_image_public_bucket_path || "",
      100,
      100
    );
  }

  return (
    <div>
      <Container type="panel" className="mb-5">
        <Panel clear={true} className="py-4">
          <div className="d-flex flex-column flex-lg-row gap-3 gap-lg-2">
            {(weight.weight_category === WeightCategory.VC ||
              weight.weight_category === WeightCategory.TTS) && (
              <WeightCoverImage
                src={audioWeightCoverImage}
                coverIndex={weight.cover_image.default_cover.image_index}
              />
            )}
            <div>
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <h1 className="fw-bold mb-2">{title}</h1>
              </div>
              <div className="d-flex gap-3 flex-wrap align-items-center">
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <div>
                    <Badge label={weightType} color={weightTagColor} />
                  </div>
                  {subtitleDivider}
                  <p>{weightCategory}</p>
                  {subtitleDivider}
                  <div className="d-flex align-items-center gap-2">
                    <LikeButton
                      {...{
                        ...ratings.makeProps({
                          entityToken: weight_token,
                          entityType: "model_weight",
                        }),
                        large: true,
                      }}
                    />
                    <BookmarkButton
                      {...{
                        ...bookmarks.makeProps({
                          entityToken: weight_token,
                          entityType: "model_weight",
                        }),
                        large: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="row g-4">
          <div className="col-12 col-xl-8 d-flex flex-column gap-3">
            <div className="media-wrapper">{renderWeightComponent(weight)}</div>

            {descriptionMD !== "" && (
              <Panel padding={true}>
                <h4 className="fw-semibold mb-3">Description</h4>
                <p>{descriptionMD}</p>
              </Panel>
            )}

            <div className="panel p-3 py-4 p-md-4 d-none d-xl-block">
              <h4 className="fw-semibold mb-3">Comments</h4>
              <CommentComponent
                entityType="user"
                entityToken={weight.weight_token}
                sessionWrapper={sessionWrapper}
              />
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="panel panel-clear d-flex flex-column gap-3">
              {/* <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  icon={faShare}
                  label="Share"
                  className="flex-grow-1"
                  onClick={openShareModal}
                />

                <div className="d-flex gap-2">
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
                </div>
              </div> */}

              <Panel className="rounded">
                <div className="d-flex gap-2 p-3">
                  <Gravatar
                    size={48}
                    username={weight.creator?.username || ""}
                    email_hash={weight.creator?.gravatar_hash || ""}
                    avatarIndex={
                      weight.creator?.default_avatar.image_index || 0
                    }
                    backgroundIndex={
                      weight.creator?.default_avatar.color_index || 0
                    }
                  />
                  <div className="d-flex flex-column">
                    {weight.creator?.display_name ? (
                      <Link
                        className="fw-medium"
                        to={`/profile/${weight.creator?.display_name}`}
                      >
                        {weight.creator?.display_name}
                      </Link>
                    ) : (
                      <p className="fw-medium text-white">Anonymous</p>
                    )}

                    <p className="fs-7">Updated: {timeUpdated}</p>
                  </div>
                </div>
              </Panel>

              <Accordion>
                <Accordion.Item title="Weight Details" defaultOpen={true}>
                  {weightDetails}
                </Accordion.Item>

                {modMediaDetails}
              </Accordion>

              <Panel className="p-3 rounded">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <h6 className="fw-medium mb-0">Share Weight</h6>
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

              {sessionWrapper.canEditTtsModelByUserToken(
                weight.creator?.user_token
              ) && (
                <div className="d-flex gap-2">
                  <Button
                    full={true}
                    variant="secondary"
                    label="Edit Weight"
                    to={`/weight/${weight_token}/edit`}
                  />
                  <Button
                    full={true}
                    variant="danger"
                    label="Delete Weight"
                    onClick={openDeleteModal}
                  />
                </div>
              )}
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
              entityToken={weight.weight_token}
              sessionWrapper={sessionWrapper}
            />
          </Panel>
        </Container>
      </div>
      <Modal
        show={isDeleteModalOpen}
        handleClose={closeDeleteModal}
        title="Delete Weight"
        content={() => (
          <>{`Are you sure you want to delete "${title}"? This action cannot be undone.`}</>
        )}
        onConfirm={remove}
      />
    </div>
  );
}
