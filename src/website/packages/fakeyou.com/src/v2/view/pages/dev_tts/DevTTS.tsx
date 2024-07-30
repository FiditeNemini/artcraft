import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MediaBrowser } from "components/modals";
import { CardBadge } from "components/entities";
import {
  Button,
  Container,
  Input,
  Label,
  Panel,
  TextArea,
  WeightCoverImage,
} from "components/common";
import { useDebounce, useInferenceJobs, useModal } from "hooks";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBell,
  faChevronRight,
  faDeleteLeft,
  faSearch,
  faWaveformLines,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import "./DevTTS.scss";
import { FeaturedVoice } from "./FeaturedVoice";
import { SessionTtsInferenceResultList } from "v2/view/_common/SessionTtsInferenceResultsList";
import StorytellerStudioCTA from "components/common/StorytellerStudioCTA";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import {
  GenerateTtsAudio,
  GenerateTtsAudioRequest,
  GenerateTtsAudioResponse,
  GenerateTtsAudioIsOk,
} from "@storyteller/components/src/api/tts/GenerateTtsAudio";
import { v4 as uuidv4 } from "uuid";
import { WeightType } from "@storyteller/components/src/api/_common/enums";
import useWeightTypeInfo from "hooks/useWeightTypeInfo";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { isMobile } from "react-device-detect";
import { useTtsStore } from "hooks";
import ExploreTts from "./ExploreTts";

interface Props {
  sessionSubscriptionsWrapper: any;
}

export default function DevTTS({ sessionSubscriptionsWrapper }: Props) {
  const { enqueueInferenceJob } = useInferenceJobs();
  const { modalState, open, close } = useModal();
  const [search, searchSet] = useState("");
  const [updated, updatedSet] = useState(false);
  const { selectedVoice, setSelectedVoice, text, setText } = useTtsStore();
  const bucketConfig = new BucketConfig();
  const preview = selectedVoice?.cover_image
    ?.maybe_cover_image_public_bucket_path
    ? bucketConfig.getCdnUrl(
        selectedVoice?.cover_image?.maybe_cover_image_public_bucket_path
      )
    : "/images/avatars/default-pfp.png";
  const textChange = ({ target }: { target: any }) => {
    setText(target.value);
  };
  const [isGenerating, setIsGenerating] = useState(false);
  usePrefixedDocumentTitle("FakeYou. Deep Fake Text to Speech.");

  const weightTypeInfo = useWeightTypeInfo(
    selectedVoice?.weight_type || WeightType.NONE
  );
  const { label: weightType, color: weightTagColor } = weightTypeInfo;

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
    emptyContent: <ExploreTts onResultSelect={handleResultSelect} />,
    showFilters: false,
    showPagination: false,
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
    "weight_31ewdsvev9bttgb4eg7zy7mj5",
    "weight_b8rncypy7gw6nb0wthnwe2kk4",
    "weight_3k28fws0v6r1ke3p0w0vw48gm",
    "weight_0f762jdzgsy1dhpb86qxy4ssm",
    "weight_1ptwk6pa8krh3ykfr7rztf3pz",
    "weight_2qbzp2nmrbbsxrxq7m53y4zan",
    "weight_msq6440ch8hj862nz5y255n8j",
    "weight_6jvgbqkzschw55qdg7exnx7zx",
  ];

  const handleSpeak = async () => {
    if (!selectedVoice || !text) return;

    setIsGenerating(true);

    const request: GenerateTtsAudioRequest = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: selectedVoice.weight_token,
      inference_text: text,
    };

    try {
      const response: GenerateTtsAudioResponse =
        await GenerateTtsAudio(request);
      if (GenerateTtsAudioIsOk(response)) {
        console.log("TTS queued successfully:", response.inference_job_token);
        enqueueInferenceJob(
          response.inference_job_token,
          FrontendInferenceJobType.TextToSpeech
        );
        setIsGenerating(false);
      } else {
        console.error("Error queuing TTS:", response.error);
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
          <h1 className="fw-bold fs-1 mb-0">Text to Speech</h1>
          <p className="mb-4 opacity-75 fw-medium">
            Make your favorite characters speak!
          </p>

          <div className="d-flex flex-column gap-4">
            <div className="fy-featured-voices-section d-none d-lg-block">
              <h5 className="fw-bold">Featured Voices</h5>
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
                        selectedVoice ? "Selected Voice" : "Select a Voice"
                      }`}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    {selectedVoice && (
                      <Button
                        icon={faBell}
                        variant="link"
                        label="Notify me when this voice improves"
                        className="fs-7"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="position-relative">
                <Input
                  autoFocus={isMobile ? false : selectedVoice ? false : true}
                  icon={faSearch}
                  placeholder={"Search from 3000+ voices"}
                  onChange={searchChange()}
                  value={search}
                  style={{ borderRadius: "0.5rem 0.5rem 0 0" }}
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
              <div className="fy-weight-picker-preview" onClick={openModal}>
                <WeightCoverImage
                  {...{
                    src: preview,
                    height: isMobile ? 70 : 80,
                    width: isMobile ? 70 : 80,
                  }}
                />
                <div className="d-flex flex-column justify-content-center flex-grow-1">
                  <h2 className="mb-1 fw-semibold d-flex gap-2 align-items-center fs-5 fy-weight-picker-preview-text">
                    <div>{selectedVoice?.title || "No Voice Selected"}</div>

                    {selectedVoice?.weight_type && (
                      <CardBadge
                        className={`fy-entity-type-${
                          selectedVoice?.weight_type || ""
                        }`}
                        label={weightType || ""}
                        small={true}
                        color={weightTagColor || ""}
                      />
                    )}
                  </h2>
                  {selectedVoice ? (
                    <span className="fs-7 d-flex gap-1 flex-column flex-lg-row">
                      <div className="d-flex gap-1">
                        by
                        <Link
                          className="fw-medium"
                          to={`/profile/${
                            selectedVoice?.creator?.username || ""
                          }`}
                          onClick={e => e.stopPropagation()}
                        >
                          {" " + selectedVoice?.creator?.display_name || ""}
                        </Link>
                      </div>

                      {/* <span className="opacity-25">|</span>
                          <span>English</span> */}
                      <div className="d-flex gap-1 align-items-center">
                        <span className="d-none d-lg-block px-1 opacity-50">
                          |
                        </span>
                        <Link
                          to={`/weight/${selectedVoice.weight_token}`}
                          className="fw-medium"
                          onClick={e => e.stopPropagation()}
                        >
                          View voice details
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="ms-2"
                          />
                        </Link>
                      </div>
                    </span>
                  ) : (
                    <span className="fs-7 opacity-75">
                      Click to select a voice
                    </span>
                  )}
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="fs-5 me-1" />
              </div>
            </div>

            <div className="row">
              <div className="d-flex flex-column gap-3 col-12 col-lg-6">
                <TextArea
                  autoFocus={selectedVoice ? true : false}
                  label="Enter Text"
                  onChange={textChange}
                  value={text}
                  rows={isMobile ? 5 : 13}
                  placeholder={`Enter the text you want ${
                    selectedVoice ? selectedVoice.title : "your character"
                  } to say...`}
                  resize={false}
                />
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    icon={faDeleteLeft}
                    label="Clear"
                    disabled={!text}
                    variant="secondary"
                    onClick={() => setText("")}
                  />
                  <Button
                    icon={faWaveformLines}
                    label="Speak"
                    onClick={handleSpeak}
                    disabled={!selectedVoice || !text}
                    isLoading={isGenerating}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="d-flex flex-column">
                  <Label label="Output" />
                  <div className="d-flex flex-column session-tts-section">
                    <SessionTtsInferenceResultList
                      sessionSubscriptionsWrapper={sessionSubscriptionsWrapper}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </Container>

      <Container type="panel" className="py-5 mt-5 d-flex flex-column gap-5">
        {/* <MentionsSection /> */}
        <StorytellerStudioCTA />
      </Container>
    </>
  );
}
