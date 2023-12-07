import React, { useCallback, useEffect, useState } from "react";
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
  faVolumeUp,
  faDeleteLeft,
  faShare,
} from "@fortawesome/pro-solid-svg-icons";
import Accordion from "components/common/Accordion";
import DataTable from "components/common/DataTable";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import useTimeAgo from "hooks/useTimeAgo";
import { CommentComponent } from "v2/view/_common/comments/CommentComponent";
import { WeightsType } from "@storyteller/components/src/api/_common/enums/WeightsType";
import { WeightsCategory } from "@storyteller/components/src/api/_common/enums/WeightsCategory";
import { SessionVoiceDesignerInferenceResultsList } from "v2/view/_common/SessionVoiceDesignerInferenceResultsList";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import TextArea from "components/common/TextArea";
import Badge from "components/common/Badge";
import FavoriteButton from "components/common/FavoriteButton";
import LikeButton from "components/common/LikeButton";

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
}

export default function WeightsPage({
  sessionWrapper,
  sessionSubscriptionsWrapper,
  inferenceJobs,
  ttsInferenceJobs,
  enqueueInferenceJob,
  inferenceJobsByCategory,
}: WeightProps) {
  const { token } = useParams<{ token: string }>();
  const [weight, setWeight] = useState<Weight | undefined | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const timeUpdated = useTimeAgo(weight?.updated_at.toISOString() || "");

  const getWeight = useCallback(async (weightToken: string) => {
    // Dummy data
    const dummyData = {
      weight_token: "1",
      title: "Harry Potter (Daniel Radcliffe)",
      created_at: new Date(),
      updated_at: new Date(),
      weights_type: WeightsType.TT2,
      weights_category: WeightsCategory.TTS,
      maybe_creator_user: {
        user_token: "test",
        username: "test",
        display_name: "Test",
        gravatar_hash: "test",
        default_avatar: {
          image_index: 1,
          color_index: 2,
        },
      },
      creator_set_visibility: "Public",
    };

    // Simulate an API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (dummyData) {
      setWeight(dummyData);
      setIsLoading(false);
    } else {
      setError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getWeight(token);
  }, [token, getWeight]);

  function renderWeightComponent(weight: Weight) {
    switch (weight.weights_category) {
      case WeightsCategory.TTS:
        return (
          <Panel padding={true}>
            <form className="mb-4">
              <div className="d-flex flex-column gap-3">
                <h4 className="fw-semibold mb-0">Use Voice</h4>
                <TextArea
                  placeholder="Enter the text you want your character to say here..."
                  // value={textBuffer}
                  // onChange={handleChangeText}
                  rows={6}
                />
              </div>

              <div className="d-flex gap-3 justify-content-end mt-3">
                <Button
                  icon={faDeleteLeft}
                  label="Clear"
                  variant="danger"
                  // onClick={handleClearText}
                />
                <Button
                  icon={faVolumeUp}
                  label="Speak"
                  // onClick={handleEnqueueTts}
                  // isLoading={isEnqueuing}
                />
              </div>
            </form>

            <Accordion>
              <Accordion.Item title="Session Results" defaultOpen={false}>
                <div>
                  <SessionVoiceDesignerInferenceResultsList
                    inferenceJobs={
                      inferenceJobsByCategory.get(
                        FrontendInferenceJobType.VoiceDesignerTts
                      )!
                    }
                    ttsInferenceJobs={ttsInferenceJobs}
                    sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                  />
                </div>
              </Accordion.Item>
            </Accordion>
          </Panel>
        );
      case WeightsCategory.VC:
        return (
          <>
            <div className="panel panel-clear">
              <div className="ratio ratio-16x9 video-bg panel-border rounded">
                Video
              </div>
            </div>
          </>
        );

      case WeightsCategory.SD:
        return <>Image</>;
      default:
        return <div>Unsupported media type</div>;
    }
  }

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

  if (error || !weight)
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
    { property: "Type", value: weight.weights_type },
    { property: "Category", value: weight.weights_category },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
    { property: "Created at", value: weight.created_at.toString() },
    { property: "Updated at", value: weight.updated_at.toString() },
  ];

  const videoDetails = [
    { property: "Type", value: weight.weights_type },
    { property: "Created at", value: weight.created_at.toString() },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
  ];

  const imageDetails = [
    { property: "Type", value: weight.weights_type },
    { property: "Created at", value: weight.created_at.toString() },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
  ];

  let weightDetails = undefined;

  switch (weight.weights_category) {
    case WeightsCategory.TTS:
      weightDetails = <DataTable data={audioDetails} />;
      break;
    case WeightsCategory.VC:
      weightDetails = <DataTable data={videoDetails} />;
      break;
    case WeightsCategory.SD:
      weightDetails = <DataTable data={imageDetails} />;
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

  let weightType = "";
  if (weight.weights_type === WeightsType.TT2) {
    weightType = "Tacotron 2";
  }

  const handleBookmark = async (data: any) => {
    console.log(
      `The item is now ${data.isLiked ? "Bookmarked" : "Not Bookmarked"}.`
    );
  };

  return (
    <div>
      <Container type="panel" className="mb-5">
        <PageHeader
          title={
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <span className="mb-1">{weight.title}</span>

              <div className="d-flex align-items-center gap-2 mb-1">
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
          }
          subText={
            <div className="d-flex gap-3 flex-wrap align-items-center">
              <div className="d-flex gap-2 align-items-center">
                <div>
                  <Badge label={weightType} color="ultramarine" />
                </div>
                <p>Text to Speech</p>
              </div>
            </div>
          }
        />

        <div className="row g-4">
          <div className="col-12 col-xl-8 d-flex flex-column gap-3">
            <div className="media-wrapper">{renderWeightComponent(weight)}</div>

            <Panel padding={true}>
              <h4 className="fw-semibold mb-3">Description</h4>
              <p>
                The chair sat in the corner where it had been for over 25 years.
                The only difference was there was someone actually sitting in
                it. How long had it been since someone had done that? Ten years
                or more he imagined. Yet there was no denying the presence in
                the chair now.
                <br />
                <br />
                The headache wouldn't go away. She's taken medicine but even
                that didn't help. The monstrous throbbing in her head continued.
                She had this happen to her only once before in her life and she
                realized that only one thing could be happening.
              </p>
            </Panel>

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
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  icon={faShare}
                  label="Share"
                  className="flex-grow-1"
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
                    username={weight.maybe_creator_user?.display_name}
                    avatarIndex={
                      weight.maybe_creator_user?.default_avatar.image_index
                    }
                    backgroundIndex={
                      weight.maybe_creator_user?.default_avatar.color_index
                    }
                  />
                  <div className="d-flex flex-column">
                    <Link
                      className="fw-medium"
                      to={`/profile/${weight.maybe_creator_user?.display_name}`}
                    >
                      {weight.maybe_creator_user?.display_name}
                    </Link>
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

              <div className="d-flex gap-2">
                <Button full={true} variant="secondary" label="Edit Weight" />
                <Button full={true} variant="danger" label="Delete Weight" />
              </div>
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
    </div>
  );
}
