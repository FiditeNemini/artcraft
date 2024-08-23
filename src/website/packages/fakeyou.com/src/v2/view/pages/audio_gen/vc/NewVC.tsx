import React, { useState } from "react";
import { MediaBrowser } from "components/modals";
import {
  Button,
  Checkbox,
  Container,
  Input,
  Label,
  Panel,
} from "components/common";
import { useDebounce, useInferenceJobs, useLocalize, useModal } from "hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faWaveformLines,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import "../AudioGen.scss";
import { FeaturedVoice } from "../FeaturedVoice";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import {
  EnqueueVoiceConversion,
  EnqueueVoiceConversionIsSuccess,
  EnqueueVoiceConversionRequest,
  EnqueueVoiceConversionResponse,
} from "@storyteller/components/src/api/voice_conversion/EnqueueVoiceConversion";
import { v4 as uuidv4 } from "uuid";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { isMobile } from "react-device-detect";
import { useVcStore } from "hooks";
import ExploreVoices from "../ExploreVoices";
import { AITools } from "components/marketing";
import VoicePickerPreview from "../VoicePickerPreview";
import VCRecordComponent from "./VCRecordComponent";
import VCUploadComponent from "./VCUploadComponent";
import VCPitchShiftComponent from "./VCPitchShiftComponent";
import VCPitchEstimateMethodComponent from "./VCPitchEstimateMethodComponent";
import { SessionVoiceConversionResultsList } from "v2/view/_common/SessionVoiceConversionResultsList";

interface Props {
  sessionSubscriptionsWrapper: any;
}

export default function NewVC({ sessionSubscriptionsWrapper }: Props) {
  const { enqueueInferenceJob } = useInferenceJobs();
  const { modalState, open, close } = useModal();
  const [search, searchSet] = useState("");
  const [updated, updatedSet] = useState(false);
  const {
    selectedVoice,
    setSelectedVoice,
    mediaUploadToken,
    setMediaUploadToken,
    semitones,
    setSemitones,
    autoConvertF0,
    setAutoConvertF0,
    maybeF0MethodOverride,
    setMaybeF0MethodOverride,
    hasUploadedFile,
    setHasUploadedFile,
    hasRecordedFile,
    setHasRecordedFile,
    formIsCleared,
    setFormIsCleared,
  } = useVcStore();
  const [isGenerating, setIsGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  usePrefixedDocumentTitle("AI Voice Conversion");

  const { t } = useLocalize("NewVC");

  const searchChange =
    (setUpdate = true) =>
    ({ target }: { target: any }) => {
      if (setUpdate) updatedSet(true);
      searchSet(target.value);
    };

  const handleResultSelect = (data: any) => {
    setSelectedVoice(data);
    close();
  };

  const mediaBrowserProps = {
    onSelect: (weight: any) => setSelectedVoice(weight),
    inputMode: 3,
    onSearchChange: searchChange(false),
    search,
    emptyContent: (
      <ExploreVoices
        onResultSelect={handleResultSelect}
        filterCategory="voice_conversion"
      />
    ),
    showFilters: false,
    showPagination: false,
    searchFilter: "voice_conversion",
  };

  useDebounce({
    blocked: !(updated && !modalState && search),
    onTimeout: () => {
      updatedSet(false);
      open({
        component: MediaBrowser,
        props: mediaBrowserProps,
      });
    },
  });

  const openModal = () => {
    open({
      component: MediaBrowser,
      props: mediaBrowserProps,
    });
  };

  const featuredVoiceTokens = [
    "weight_aaq74t6as5wgqvgqwheesv191",
    "weight_ycxe10b37a04wn5gen9srm86q",
    "weight_r0f26jm0g4bsbawhdh3zk7d04",
    "weight_x0c5a09bmndmyq05asj69k2nn",
    "weight_cspd7e4wpjnrv1ygsa19b0gff",
    "weight_a232w8k710gr4vgsptxy8bj3b",
    "weight_zmrhs5j5d8qm4kantkmc6w945",
    "weight_z7j14hz7dcvsg9n26dq9ft9eg",
  ];

  const handlePitchMethodChange = (value: any) => {
    setMaybeF0MethodOverride(value);
  };

  const handlePitchChange = (value: any) => {
    setSemitones(value);
  };

  const handleAutoF0Change = (ev: React.FormEvent<HTMLInputElement>) => {
    const value = (ev.target as HTMLInputElement).checked;
    setAutoConvertF0(value);
  };

  const handleConvert = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (!selectedVoice || !mediaUploadToken) return;

    setIsGenerating(true);

    const request: EnqueueVoiceConversionRequest = {
      uuid_idempotency_token: uuidv4(),
      voice_conversion_model_token: selectedVoice.weight_token,
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

    try {
      const response: EnqueueVoiceConversionResponse =
        await EnqueueVoiceConversion(request);
      if (EnqueueVoiceConversionIsSuccess(response)) {
        console.log("VC queued successfully:", response.inference_job_token);
        enqueueInferenceJob(
          response.inference_job_token,
          FrontendInferenceJobType.VoiceConversion
        );
        setIsGenerating(false);
      } else {
        console.error("Error queuing VC:", "failed to enqueue");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Container type="panel" className="mt-3 mt-lg-5">
        <Panel padding={true}>
          <form onSubmit={handleConvert}>
            <h1 className="fw-bold fs-1 mb-0">{t("title.vc")}</h1>
            <p className="mb-4 opacity-75 fw-medium">{t("subtitle.vc")}</p>

            <div className="d-flex flex-column gap-3">
              <div className="fy-featured-voices-section d-none d-lg-block">
                <h5 className="fw-bold">{t("title.featuredVoices")}</h5>
                <div className="row g-3">
                  {featuredVoiceTokens.map(token => (
                    <FeaturedVoice
                      key={token}
                      token={token}
                      onClick={setSelectedVoice}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label label={t("label.search")} />
                <div className="position-relative">
                  <Input
                    autoFocus={isMobile ? false : selectedVoice ? false : true}
                    icon={faSearch}
                    placeholder={t("input.searchPlaceholder")}
                    onChange={searchChange()}
                    value={search}
                  />
                  {search && (
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="position-absolute opacity-75 fs-5"
                      style={{
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                      onClick={() => searchSet("")}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="d-flex align-items-center">
                  {!selectedVoice && (
                    <div className="mb-2">
                      <div className="focus-point" />
                    </div>
                  )}

                  <div className="d-flex gap-2 align-items-center w-100">
                    <div className="flex-grow-1">
                      <Label
                        label={`${
                          selectedVoice
                            ? t("label.selected")
                            : t("label.select")
                        }`}
                      />
                    </div>

                    {/* Commented out notify voice improvement for now */}
                    {/* <div className="d-flex gap-2">
                    {selectedVoice && (
                      <Button
                        icon={faBell}
                        variant="link"
                        label="Notify me when this voice improves"
                        className="fs-7"
                      />
                    )}
                  </div> */}
                  </div>
                </div>

                <VoicePickerPreview
                  selectedVoice={selectedVoice}
                  openModal={openModal}
                />
              </div>

              <div className="row">
                <div className="d-flex flex-column gap-3 col-12 col-lg-6">
                  <div>
                    <Label label={t("label.audioInput")} />
                    <div className="d-flex flex-column gap-3">
                      {!hasUploadedFile && (
                        <div>
                          <VCRecordComponent
                            setMediaUploadToken={setMediaUploadToken}
                            formIsCleared={formIsCleared}
                            setFormIsCleared={setFormIsCleared}
                            setHasRecordedFile={setHasRecordedFile}
                            hasRecordedFile={hasRecordedFile}
                            setIsRecordingAudio={setIsRecordingAudio}
                          />
                        </div>
                      )}

                      {!hasUploadedFile && !hasRecordedFile && (
                        <div className="d-flex gap-3 align-items-center">
                          <hr className="w-100" />
                          <span className="opacity-75 fw-medium">
                            {t("divider.or")}
                          </span>
                          <hr className="w-100" />
                        </div>
                      )}
                      {!hasRecordedFile && (
                        <div>
                          <div className="upload-component">
                            <VCUploadComponent
                              setMediaUploadToken={setMediaUploadToken}
                              formIsCleared={formIsCleared}
                              setFormIsCleared={setFormIsCleared}
                              setHasUploadedFile={setHasUploadedFile}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(hasUploadedFile || hasRecordedFile) && (
                    <div>
                      <Label label={t("label.pitchControl")} />
                      <div className="d-flex flex-column gap-3">
                        <VCPitchEstimateMethodComponent
                          pitchMethod={maybeF0MethodOverride}
                          onMethodChange={handlePitchMethodChange}
                        />
                        <VCPitchShiftComponent
                          min={-36}
                          max={36}
                          step={1}
                          value={semitones}
                          onPitchChange={handlePitchChange}
                        />
                        <Checkbox
                          label={t("label.autoF0")}
                          className="mb-0 fs-7"
                          onChange={handleAutoF0Change}
                          checked={autoConvertF0}
                        />
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <Button
                      icon={faWaveformLines}
                      label={t("button.convert")}
                      type="submit"
                      disabled={!selectedVoice || !mediaUploadToken}
                      isLoading={isGenerating}
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="d-flex flex-column">
                    <Label label={t("label.output")} />
                    <div className="d-flex flex-column session-vc-section">
                      <SessionVoiceConversionResultsList
                        sessionSubscriptionsWrapper={
                          sessionSubscriptionsWrapper
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Panel>
      </Container>

      <Container type="panel" className="pt-5 mt-5">
        <Panel clear={true}>
          <h2 className="fw-bold mb-3">Try our other AI tools</h2>
          <AITools />
        </Panel>
        {/* <MentionsSection /> */}
        {/* <StorytellerStudioCTA /> */}
      </Container>
    </>
  );
}
