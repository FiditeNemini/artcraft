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
import { WeightType } from "@storyteller/components/src/api/_common/enums/WeightType";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";
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
import NonRouteTabs from "components/common/Tabs/NonRouteTabs";
import { SessionVoiceConversionResultsList } from "v2/view/_common/SessionVoiceConversionResultsList";
import SplitPanel from "components/common/SplitPanel";
import VdInferencePanel from "./inference_panels/VdInferencePanel";
// import PitchEstimateMethodComponent from "../vc/vc_model_list/components/PitchEstimateMethodComponent";
// import PitchShiftComponent from "../vc/vc_model_list/components/PitchShiftComponent";
// import { SessionVoiceConversionResultsList } from "v2/view/_common/SessionVoiceConversionResultsList";
// import RecordComponent from "../vc/vc_model_list/components/RecordComponent";

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
      weight_type: WeightType.VALL_E,
      weight_category: WeightCategory.ZS,
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
      description_markdown: "This is a test description",
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
    switch (weight.weight_category) {
      case WeightCategory.TTS:
        return (
          <Panel padding={true}>
            <form className="mb-4">
              <div className="d-flex flex-column gap-3">
                <h4 className="fw-semibold">Generate TTS</h4>
                <TextArea
                  placeholder="Enter the text you want your character to say here..."
                  // value={textBuffer}
                  // onChange={handleChangeText}
                  rows={6}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end mt-3">
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
              <Accordion.Item title="Session TTS Results" defaultOpen={false}>
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
      case WeightCategory.VC:
        const vcTabs = [
          {
            label: "Upload",
            content: (
              <div>
                <div className="d-flex flex-column gap-4 h-100">
                  <div>
                    <label className="sub-title">Upload File</label>
                    <div className="d-flex flex-column gap-3 upload-component">
                      (Upload Component here)
                      {/* <UploadComponent
                  setMediaUploadToken={setMediaUploadToken}
                  formIsCleared={formIsCleared}
                  setFormIsCleared={setFormIsCleared}
                  setCanConvert={setCanConvert}
                  changeConvertIdempotencyToken={
                    changeConvertIdempotencyToken
                  }
                /> */}
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Pitch Control</label>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        (Pitch Estimate Method Component here)
                        {/* <PitchEstimateMethodComponent
                    pitchMethod={maybeF0MethodOverride}
                    onMethodChange={handlePitchMethodChange}
                  /> */}
                      </div>
                      <div>
                        (Pitch Shift Component here)
                        {/* <PitchShiftComponent
                    min={-36}
                    max={36}
                    step={1}
                    value={semitones}
                    onPitchChange={handlePitchChange}
                  /> */}
                      </div>
                      <div className="form-check">
                        (Auto F0 Checkbox here)
                        {/* <input
                    id="autoF0Checkbox"
                    className="form-check-input"
                    type="checkbox"
                    checked={autoConvertF0}
                    onChange={handleAutoF0Change}
                  /> */}
                        <label
                          className="form-check-label"
                          htmlFor="autoF0Checkbox"
                        >
                          Auto F0 (off for singing, on for speech)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Convert Audio</label>

                    <div className="d-flex gap-3">
                      (Convert Button here)
                      {/* <Button
                  className={speakButtonClass}
                  onClick={handleVoiceConversion}
                  type="submit"
                  disabled={!enableConvertButton}
                >
                  <FontAwesomeIcon
                    icon={faRightLeft}
                    className="me-2"
                  />
                  Convert
                </Button> */}
                    </div>
                  </div>
                </div>
              </div>
            ),
            padding: true,
          },
          {
            label: "Record",
            content: (
              <div>
                <div className="d-flex flex-column gap-4 h-100">
                  <div>
                    <label className="sub-title">Record Audio</label>
                    <div className="d-flex flex-column gap-3 upload-component">
                      (Record Component here)
                      {/* <RecordComponent
                setMediaUploadToken={setMediaUploadToken}
                formIsCleared={formIsCleared}
                setFormIsCleared={setFormIsCleared}
                setCanConvert={setCanConvert}
                changeConvertIdempotencyToken={
                  changeConvertIdempotencyToken
                }
              /> */}
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Pitch Control</label>
                    <div className="d-flex flex-column gap-3">
                      <div>
                        (Pitch Estimate Method Component here)
                        {/* <PitchEstimateMethodComponent
                  pitchMethod={maybeF0MethodOverride}
                  onMethodChange={handlePitchMethodChange}
                /> */}
                      </div>
                      <div>
                        (Pitch Shift Component here)
                        {/* <PitchShiftComponent
                  min={-36}
                  max={36}
                  step={1}
                  value={semitones}
                  onPitchChange={handlePitchChange}
                /> */}
                      </div>
                      <div className="form-check">
                        (Auto F0 Checkbox here)
                        {/* <input
                  id="autoF0CheckboxMic"
                  className="form-check-input"
                  type="checkbox"
                  checked={autoConvertF0}
                  onChange={handleAutoF0Change}
                /> */}
                        <label
                          className="form-check-label"
                          htmlFor="autoF0CheckboxMic"
                        >
                          Auto F0 (off for singing, on for speech)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="sub-title">Convert Audio</label>

                    <div className="d-flex gap-3">
                      (Convert Button here)
                      {/* <Button
                className={speakButtonClass}
                onClick={handleVoiceConversion}
                type="submit"
                disabled={!enableConvertButton}
              >
                <FontAwesomeIcon
                  icon={faRightLeft}
                  className="me-2"
                />
                Convert
                {convertLoading && <LoadingIcon />}
              </Button> */}
                    </div>
                  </div>
                </div>
              </div>
            ),
            padding: true,
          },
        ];

        return (
          <SplitPanel>
            <SplitPanel.Header padding={true}>
              <h4 className="fw-semibold mb-0">Generate Voice Conversion</h4>
            </SplitPanel.Header>

            <SplitPanel.Body>
              <form
              // onSubmit={handleFormSubmit}
              >
                <hr className="m-0" />
                <NonRouteTabs tabs={vcTabs} />
              </form>
            </SplitPanel.Body>
            <SplitPanel.Footer padding={true}>
              <Accordion>
                <Accordion.Item title="Session V2V Results" defaultOpen={false}>
                  <SessionVoiceConversionResultsList
                    inferenceJobs={
                      inferenceJobsByCategory.get(
                        FrontendInferenceJobType.VoiceConversion
                      )!
                    }
                    sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                  />
                </Accordion.Item>
              </Accordion>
            </SplitPanel.Footer>
          </SplitPanel>
        );

      case WeightCategory.ZS:
        return (
          <div className="d-flex flex-column gap-3">
            <VdInferencePanel
              inferenceJobs={inferenceJobs}
              sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
              enqueueInferenceJob={enqueueInferenceJob}
              inferenceJobsByCategory={inferenceJobsByCategory}
              ttsInferenceJobs={ttsInferenceJobs}
              voiceToken={weight.weight_token}
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
      weightType: "HiFi-GAN Tacontron 2",
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

  let { weightType, weightTagColor } = weightTypeMap[weight.weight_type] || {
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

  let { weightCategory } = weightCategoryMap[weight.weight_category] || {
    weightCategory: "",
  };

  const voiceDetails = [
    { property: "Type", value: weightType },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
    { property: "Created at", value: weight.created_at.toString() },
    { property: "Updated at", value: weight.updated_at.toString() },
  ];

  const imageDetails = [
    { property: "Type", value: weightType },
    { property: "Category", value: weightCategory },
    {
      property: "Visibility",
      value: weight.creator_set_visibility.toString(),
    },
    { property: "Created at", value: weight.created_at.toString() },
    { property: "Updated at", value: weight.updated_at.toString() },

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
              <span>{weight.title}</span>

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
                  <Badge label={weightType} color={weightTagColor} />
                </div>
                <p>{weightCategory}</p>
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
