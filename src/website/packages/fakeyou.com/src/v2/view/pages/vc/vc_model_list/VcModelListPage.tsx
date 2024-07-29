import React, { useState, useEffect, useCallback } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { v4 as uuidv4 } from "uuid";

import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  faBarsStaggered,
  faMicrophone,
  faRightLeft,
} from "@fortawesome/pro-solid-svg-icons";
import UploadComponent from "./components/UploadComponent";
import RecordComponent from "./components/RecordComponent";
import { usePrefixedDocumentTitle } from "../../../../../common/UsePrefixedDocumentTitle";
import {
  ListVoiceConversionModels,
  VoiceConversionModelListItem,
} from "@storyteller/components/src/api/voice_conversion/ListVoiceConversionModels";
import { VcModelListSearch } from "./components/VcModelListSearchComponent";
import {
  EnqueueVoiceConversion,
  EnqueueVoiceConversionFrequencyMethod,
  EnqueueVoiceConversionIsSuccess,
  EnqueueVoiceConversionRequest,
} from "@storyteller/components/src/api/voice_conversion/EnqueueVoiceConversion";
import { Analytics } from "../../../../../common/Analytics";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { SessionVoiceConversionResultsList } from "../../../_common/SessionVoiceConversionResultsList";
import PitchShiftComponent from "./components/PitchShiftComponent";
import PitchEstimateMethodComponent from "./components/PitchEstimateMethodComponent";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { useInferenceJobs, useLocalize } from "hooks";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { Container, Panel } from "components/common";
import { faWaveformLines } from "@fortawesome/pro-solid-svg-icons";
import MentionsSection from "components/common/MentionsSection";
import StorytellerStudioCTA from "components/common/StorytellerStudioCTA";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;

  voiceConversionModels: Array<VoiceConversionModelListItem>;
  setVoiceConversionModels: (
    ttsVoices: Array<VoiceConversionModelListItem>
  ) => void;

  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
  setMaybeSelectedVoiceConversionModel: (
    maybeSelectedVoiceConversionModel: VoiceConversionModelListItem
  ) => void;
}

function VcModelListPage(props: Props) {
  usePrefixedDocumentTitle("AI Voice Conversion");

  const { enqueueInferenceJob } = useInferenceJobs();
  const { t } = useLocalize("VcModelListPage");
  PosthogClient.recordPageview();

  const [convertLoading, setConvertLoading] = useState(false);
  const [canConvert, setCanConvert] = useState(false);

  const [mediaUploadToken, setMediaUploadToken] = useState<string | undefined>(
    undefined
  );

  const [convertIdempotencyToken, setConvertIdempotencyToken] =
    useState(uuidv4());

  const [autoConvertF0, setAutoConvertF0] = useState(false);

  const [maybeF0MethodOverride, setMaybeF0MethodOverride] =
    useState<EnqueueVoiceConversionFrequencyMethod>(
      EnqueueVoiceConversionFrequencyMethod.Rmvpe
    );

  const [semitones, setSemitones] = useState(0);

  // NB: Something of a UI hack here.
  // The 3rd party microphone component doesn't let you clear it, so we emulate form clearing
  // with this variable.
  const [formIsCleared, setFormIsCleared] = useState(false);

  let {
    setVoiceConversionModels,
    voiceConversionModels,
    maybeSelectedVoiceConversionModel,
    setMaybeSelectedVoiceConversionModel,
  } = props;

  const vcModelsLoaded = voiceConversionModels.length > 0;

  const listModels = useCallback(async () => {
    if (vcModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListVoiceConversionModels();
    if (models) {
      setVoiceConversionModels(models);
      if (!maybeSelectedVoiceConversionModel && models.length > 0) {
        let model = models[0];
        const featuredModels = models.filter(m => m.is_front_page_featured);
        if (featuredModels.length > 0) {
          // Random featured model
          model =
            featuredModels[Math.floor(Math.random() * featuredModels.length)];
        }
        setMaybeSelectedVoiceConversionModel(model);
      }
    }
  }, [
    setVoiceConversionModels,
    maybeSelectedVoiceConversionModel,
    setMaybeSelectedVoiceConversionModel,
    vcModelsLoaded,
  ]);

  useEffect(() => {
    listModels();
  }, [listModels]);

  const changeConvertIdempotencyToken = () => {
    setConvertIdempotencyToken(uuidv4());
  };

  const interceptModelChange = (
    maybeSelectedVoiceConversionModel: VoiceConversionModelListItem
  ) => {
    if (
      maybeSelectedVoiceConversionModel !==
      props.maybeSelectedVoiceConversionModel
    ) {
      changeConvertIdempotencyToken();
    }
    props.setMaybeSelectedVoiceConversionModel(
      maybeSelectedVoiceConversionModel
    );
  };

  const handleVoiceConversion = async () => {
    if (
      props.maybeSelectedVoiceConversionModel === undefined ||
      mediaUploadToken === undefined
    ) {
      return;
    }

    setConvertLoading(true);

    let request: EnqueueVoiceConversionRequest = {
      uuid_idempotency_token: convertIdempotencyToken,
      voice_conversion_model_token:
        props.maybeSelectedVoiceConversionModel.token,
      source_media_upload_token: mediaUploadToken,
    };

    if (semitones !== 0) {
      request.transpose = semitones;
    }

    if (maybeF0MethodOverride !== undefined) {
      request.override_f0_method = maybeF0MethodOverride;
    }

    if (autoConvertF0) {
      request.auto_predict_f0 = true;
    }

    Analytics.voiceConversionGenerate(
      props.maybeSelectedVoiceConversionModel.token
    );

    let result = await EnqueueVoiceConversion(request);

    if (EnqueueVoiceConversionIsSuccess(result)) {
      enqueueInferenceJob(
        result.inference_job_token,
        FrontendInferenceJobType.VoiceConversion
      );
    }

    setConvertLoading(false);
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  const handlePitchChange = (value: any) => {
    setSemitones(value);
    changeConvertIdempotencyToken();
  };

  const handlePitchMethodChange = (value: any) => {
    setMaybeF0MethodOverride(value);
    changeConvertIdempotencyToken();
  };

  const handleAutoF0Change = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).checked;
    setAutoConvertF0(value);
    changeConvertIdempotencyToken();
  };

  const speakButtonClass = convertLoading
    ? "btn btn-primary w-100 disabled"
    : "btn btn-primary w-100";

  const enableConvertButton =
    canConvert &&
    mediaUploadToken !== undefined &&
    props.maybeSelectedVoiceConversionModel !== undefined;

  return (
    <>
      <Container type="panel">
        <PageHeaderWithImage
          headerImage="mascot/vc.webp"
          titleIcon={faWaveformLines}
          title={t("heroTitle")}
          subText={t("heroText")}
          yOffset="78%"
        />

        {/* <div  className="container">
        <div className="alert alert-info">
          <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
          <span className="fw-medium">
            Get rewarded from our $15k prize pool for creating Voice to Voice
            models!
          </span>
          <Link to="/commissions" className="fw-semibold ms-2">
            See details <FontAwesomeIcon icon={faArrowRight} className="ms-1" />
          </Link>
        </div>
      </div> */}

        <Panel padding={true}>
          <div className="d-flex gap-4">
            <form
              className="w-100 d-flex flex-column"
              onSubmit={handleFormSubmit}
            >
              {/* Explore Rollout */}
              <label className="sub-title">
                {t("vcVoiceLabel", { 0: voiceConversionModels.length })}
              </label>
              <div className="input-icon-search pb-4">
                <span className="form-control-feedback">
                  <FontAwesomeIcon icon={faMicrophone} />
                </span>

                <VcModelListSearch
                  voiceConversionModels={props.voiceConversionModels}
                  setVoiceConversionModels={props.setVoiceConversionModels}
                  maybeSelectedVoiceConversionModel={
                    props.maybeSelectedVoiceConversionModel
                  }
                  setMaybeSelectedVoiceConversionModel={interceptModelChange}
                />
              </div>

              <div className="row gx-5 gy-5">
                <div className="col-12 col-lg-6 d-flex flex-column gap-4">
                  <ul className="nav nav-tabs nav-vc" id="myTab" role="tablist">
                    <li className="nav-item w-100" role="presentation">
                      <button
                        className="nav-link active w-100"
                        id="prerecorded-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#prerecorded"
                        type="button"
                        role="tab"
                        aria-controls="prerecorded"
                        aria-selected="true"
                      >
                        {t("vcTabUpload")}
                      </button>
                    </li>
                    <li className="nav-item w-100" role="presentation">
                      <button
                        className="nav-link w-100"
                        id="recordaudio-tab"
                        data-bs-toggle="tab"
                        data-bs-target="#recordaudio"
                        type="button"
                        role="tab"
                        aria-controls="recordaudio"
                        aria-selected="false"
                      >
                        {t("vcTabRecord")}
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="prerecorded"
                      role="tabpanel"
                      aria-labelledby="prerecorded-tab"
                    >
                      <div className="d-flex flex-column gap-4 h-100">
                        <div>
                          <label className="sub-title">
                            {t("vcUploadFileLabel")}
                          </label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            <UploadComponent
                              setMediaUploadToken={setMediaUploadToken}
                              formIsCleared={formIsCleared}
                              setFormIsCleared={setFormIsCleared}
                              setCanConvert={setCanConvert}
                              changeConvertIdempotencyToken={
                                changeConvertIdempotencyToken
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="sub-title">
                            {t("vcPitchControlLabel")}
                          </label>
                          <div className="d-flex flex-column gap-3">
                            <div>
                              <PitchEstimateMethodComponent
                                pitchMethod={maybeF0MethodOverride}
                                onMethodChange={handlePitchMethodChange}
                              />
                            </div>
                            <div>
                              <PitchShiftComponent
                                min={-36}
                                max={36}
                                step={1}
                                value={semitones}
                                onPitchChange={handlePitchChange}
                              />
                            </div>
                            <div className="form-check">
                              <input
                                id="autoF0Checkbox"
                                className="form-check-input"
                                type="checkbox"
                                checked={autoConvertF0}
                                onChange={handleAutoF0Change}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="autoF0Checkbox"
                              >
                                Auto F0 ({t("vcPitchControlF0")})
                              </label>
                            </div>
                          </div>
                        </div>
                        {/*<div>
                          <label className="sub-title">
                            Or pick from your audio collection (5 files)
                          </label>
                          <div className="d-flex flex-column gap-3">
                            <div className="input-icon-search">
                              <span className="form-control-feedback">
                                <FontAwesomeIcon icon={faFiles} />
                              </span>

                              <Select
                                value="test"
                                classNames={SearchFieldClass}
                                // On mobile, we don't want the onscreen keyboard to take up half the UI.
                                autoFocus={false}
                                isSearchable={false}
                                // NB: The following settings improve upon performance.
                                // See: https://github.com/JedWatson/react-select/issues/3128
                                filterOption={createFilter({
                                  ignoreAccents: false,
                                })}
                              />
                            </div>
                          </div>
                              </div>*/}

                        <div>
                          <label className="sub-title">
                            {t("vcConvertLabel")}
                          </label>

                          <div className="d-flex gap-3">
                            <button
                              className={speakButtonClass}
                              onClick={handleVoiceConversion}
                              type="submit"
                              disabled={!enableConvertButton}
                            >
                              <FontAwesomeIcon
                                icon={faRightLeft}
                                className="me-2"
                              />
                              {t("vcButtonConvert")}
                              {convertLoading && <LoadingIcon />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="recordaudio"
                      role="tabpanel"
                      aria-labelledby="recordaudio-tab"
                    >
                      <div className="d-flex flex-column gap-4 h-100">
                        <div>
                          <label className="sub-title">
                            {t("vcRecordAudioLabel")}
                          </label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            <RecordComponent
                              setMediaUploadToken={setMediaUploadToken}
                              formIsCleared={formIsCleared}
                              setFormIsCleared={setFormIsCleared}
                              setCanConvert={setCanConvert}
                              changeConvertIdempotencyToken={
                                changeConvertIdempotencyToken
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="sub-title">
                            {t("vcPitchControlLabel")}
                          </label>
                          <div className="d-flex flex-column gap-3">
                            <div>
                              <PitchEstimateMethodComponent
                                pitchMethod={maybeF0MethodOverride}
                                onMethodChange={handlePitchMethodChange}
                              />
                            </div>
                            <div>
                              <PitchShiftComponent
                                min={-36}
                                max={36}
                                step={1}
                                value={semitones}
                                onPitchChange={handlePitchChange}
                              />
                            </div>
                            <div className="form-check">
                              <input
                                id="autoF0CheckboxMic"
                                className="form-check-input"
                                type="checkbox"
                                checked={autoConvertF0}
                                onChange={handleAutoF0Change}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="autoF0CheckboxMic"
                              >
                                Auto F0 ({t("vcPitchControlF0")})
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="sub-title">
                            {t("vcConvertLabel")}
                          </label>

                          <div className="d-flex gap-3">
                            <button
                              className={speakButtonClass}
                              onClick={handleVoiceConversion}
                              type="submit"
                              disabled={!enableConvertButton}
                            >
                              <FontAwesomeIcon
                                icon={faRightLeft}
                                className="me-2"
                              />
                              {t("vcButtonConvert")}
                              {convertLoading && <LoadingIcon />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="d-flex flex-column gap-3">
                    <h4 className="text-center text-lg-start">
                      <FontAwesomeIcon
                        icon={faBarsStaggered}
                        className="me-3"
                      />
                      {t("vcResultsTitle")}
                    </h4>
                    <div className="d-flex flex-column gap-3 session-tts-section session-vc-section">
                      <SessionVoiceConversionResultsList
                        sessionSubscriptionsWrapper={
                          props.sessionSubscriptionsWrapper
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* <div className="pt-5">
          <BackLink link="/" text="Back to main page" />
        </div> */}
        </Panel>
      </Container>

      <Container type="panel" className="py-5 mt-5 d-flex flex-column gap-5">
        <MentionsSection />
        <StorytellerStudioCTA />
      </Container>
    </>
  );
}

const LoadingIcon: React.FC = () => {
  return (
    <>
      <span
        className="spinner-border spinner-border-sm ms-3"
        role="status"
        aria-hidden="true"
      ></span>
      <span className="visually-hidden">Loading...</span>
    </>
  );
};

export { VcModelListPage };
