import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Weight } from "@storyteller/components/src/api/weights/GetWeight";
import Container from "components/common/Container";
import Panel from "components/common/Panel";
import PageHeader from "components/layout/PageHeader";
import Skeleton from "components/common/Skeleton";
import Button from "components/common/Button";
import {
  faCircleExclamation,
  faLink,
  faShare,
} from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import useTimeAgo from "hooks/useTimeAgo";
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
import FavoriteButton from "components/common/FavoriteButton";
import LikeButton from "components/common/LikeButton";
import VdInferencePanel from "./inference_panels/VdInferencePanel";
import VcInferencePanel from "./inference_panels/VcInferencePanel";
import TtsInferencePanel from "./inference_panels/TtsInferencePanel";
import Modal from "components/common/Modal";
import SocialButton from "components/common/SocialButton";
import Input from "components/common/Input";
import { GetWeight } from "@storyteller/components/src/api/weights/GetWeight";
import { CreateBookmark } from "@storyteller/components/src/api/bookmarks/CreateBookmark";

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
  const { weight_token } = useParams<{ weight_token: string }>();
  const [weight, setWeight] = useState<Weight | undefined | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const timeUpdated = useTimeAgo(weight?.updated_at?.toISOString() || "");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Copy");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (weight_token && !weight && isLoading) {
      GetWeight(weight_token,{})
      .then((res: any) => {
        console.log("🏋️",res);
        setIsLoading(false);
        setWeight(res);
      })
      .catch((err) => {
        setError(err);
      });
    }
  },[isLoading, weight, weight_token]);

  function renderWeightComponent(weight: Weight) {
    switch (weight.weights_category) {
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
  if (error || !weight)
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

  const weightTypeMap: Record<
    WeightType,
    { weightType: string; weightTagColor: string }
  > = {
    [WeightType.TT2]: {
      weightType: "Tacotron 2",
      weightTagColor: "ultramarine",
    },
    [WeightType.HIFIGAN_TT2]: {
      weightType: "HiFi-GAN Tacotron 2",
      weightTagColor: "blue",
    },
    [WeightType.VALL_E]: { weightType: "VALL-E", weightTagColor: "purple" },
    [WeightType.LORA]: { weightType: "LoRA", weightTagColor: "pink" },
    [WeightType.RVCv2]: {
      weightType: "RVCv2",
      weightTagColor: "orange",
    },
    [WeightType.SD_15]: {
      weightType: "Stable Diffusion 1.5",
      weightTagColor: "lime",
    },
    [WeightType.SDXL]: {
      weightType: "Stable Diffusion XL",
      weightTagColor: "green",
    },
    [WeightType.SVC]: {
      weightType: "SVC",
      weightTagColor: "aqua",
    },
  };

  let { weightType, weightTagColor } = weightTypeMap[weight.weights_type] || {
    weightType: "",
    weightTagColor: "",
  };

  const weightCategoryMap: Record<WeightCategory, { weightCategory: string }> =
    {
      [WeightCategory.TTS]: { weightCategory: "Text to Speech" },
      [WeightCategory.VC]: { weightCategory: "Voice to Voice" },
      [WeightCategory.SD]: { weightCategory: "Stable Diffusion" },
      [WeightCategory.ZS]: { weightCategory: "Voice Designer" },
      [WeightCategory.VOCODER]: { weightCategory: "Vocoder" },
    };

  let { weightCategory } = weightCategoryMap[weight.weights_category] || {
    weightCategory: "",
  };

  const voiceDetails = [
    { property: "Type", value: weightType },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
    { property: "Created at", value: weight.created_at?.toString() || "" },
    { property: "Updated at", value: weight.updated_at?.toString() || "" },
  ];

  const imageDetails = [
    { property: "Type", value: weightType },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
    { property: "Created at", value: weight.created_at?.toString() || "" },
    { property: "Updated at", value: weight.updated_at?.toString() || "" },

    //more to add for image/stable diffusion details
  ];

  let weightDetails = undefined;

  switch (weight.weights_category) {
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

  const handleBookmark = (toggled: boolean) => {
    return CreateBookmark("",{
      entity_token: weight_token,
      entity_type: "model_weight"
    })
    .then((res: any) => {
      console.log("🔖",res);
    });
  };

  const subtitleDivider = <span className="opacity-25 fs-5 fw-light">|</span>;

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setButtonLabel("Copied!");
    setTimeout(() => setButtonLabel("Copy"), 1000);
  };

  const shareUrl = `https://fakeyou.com/weight/${weight.weight_token}`;
  const shareText = `Use FakeYou to generate speech as ${
    weight.title || "your favorite characters"
  }!`;

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <div>
      <Container type="panel" className="mb-5">
        <PageHeader
          title={
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className="mb-1">{weight.title}</span>
            </div>
          }
          subText={
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
                    likeCount={1200}
                    onToggle={handleBookmark}
                    large={true}
                  />
                  <FavoriteButton
                    favoriteCount={100}
                    onToggle={handleBookmark}
                    large={true}
                  />
                </div>
              </div>
            </div>
          }
        />

        <div className="row g-4">
          <div className="col-12 col-xl-8 d-flex flex-column gap-3">
            <div className="media-wrapper">{renderWeightComponent(weight)}</div>

            {weight.description_markdown !== "" && (
              <Panel padding={true}>
                <h4 className="fw-semibold mb-3">Description</h4>
                <p>{weight.description_markdown}</p>
              </Panel>
            )}

            <div className="panel p-3 py-4 p-md-4 d-none d-xl-block">
              <h4 className="fw-semibold mb-3">Comments</h4>
              <CommentComponent
                entityType="user"
                entityToken={"1"}
                sessionWrapper={sessionWrapper}
              />
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="panel panel-clear d-flex flex-column gap-3">
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  icon={faShare}
                  label="Share"
                  className="flex-grow-1"
                  onClick={openShareModal}
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

              <Panel className="rounded">
                <div className="d-flex gap-2 p-3">
                  <Gravatar
                    size={48}
                    username={weight.creator?.display_name}
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

      {/* Delete Modal */}
      <Modal
        show={isDeleteModalOpen}
        handleClose={closeDeleteModal}
        title="Delete Weight"
        content="Are you sure you want to delete this weight? This action cannot be undone."
      />
    </div>
  );
}
