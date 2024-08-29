import React, { useState } from "react";
import { MediaBrowser } from "components/modals";
import {
  Button,
  Container,
  Input,
  Label,
  Panel,
  TextArea,
} from "components/common";
import {
  useDebounce,
  useInferenceJobs,
  useLocalize,
  useModal,
  useSession,
} from "hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faSearch,
  faWaveformLines,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import "../AudioGen.scss";
import { FeaturedVoice } from "../FeaturedVoice";
import { SessionTtsInferenceResultList } from "v2/view/_common/SessionTtsInferenceResultsList";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import {
  GenerateTtsAudio,
  GenerateTtsAudioRequest,
  GenerateTtsAudioResponse,
  GenerateTtsAudioIsOk,
} from "@storyteller/components/src/api/tts/GenerateTtsAudio";
import { v4 as uuidv4 } from "uuid";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { isMobile } from "react-device-detect";
import { useTtsStore } from "hooks";
import ExploreTts from "../ExploreVoices";
import { AITools } from "components/marketing";
import VoicePickerPreview from "../VoicePickerPreview";
import { getLocalStorageItem, setLocalStorageItem } from "utils/localStorage";

interface Props {
  sessionSubscriptionsWrapper: any;
}

export default function NewTTS({ sessionSubscriptionsWrapper }: Props) {
  const { enqueueInferenceJob } = useInferenceJobs();
  const { modalState, open, close } = useModal();
  const { loggedIn, loggedInOrModal } = useSession();
  const [search, searchSet] = useState("");
  const [updated, updatedSet] = useState(false);
  const { selectedVoice, setSelectedVoice, text, setText } = useTtsStore();
  const textChange = ({ target }: { target: any }) => {
    setText(target.value);
  };
  const [isGenerating, setIsGenerating] = useState(false);
  usePrefixedDocumentTitle("FakeYou. Deep Fake Text to Speech.");

  const { t } = useLocalize("NewTTS");

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
      <ExploreTts
        onResultSelect={handleResultSelect}
        filterCategory="text_to_speech"
      />
    ),
    showFilters: false,
    showPagination: false,
    searchFilter: "text_to_speech",
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
    "weight_qdtx8h0mvn945md9tm2zaq422",
    "weight_f9wz0b1amfxhj1fnxxwtwn3rq",
    "weight_0f762jdzgsy1dhpb86qxy4ssm",
    "weight_7jk8mgwkzsycqrxmfw5q4245y",
    "weight_3k28fws0v6r1ke3p0w0vw48gm",
    "weight_2qbzp2nmrbbsxrxq7m53y4zan",
    "weight_msq6440ch8hj862nz5y255n8j",
    "weight_6jvgbqkzschw55qdg7exnx7zx",
  ];

  const handleSpeak = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const generationCountKey = "generationCountTTS";
    const promptShownKey = "promptShownTTS";
    const ttl = 2 * 60 * 1000; // 2 minutes in milliseconds
    let generationCount = parseInt(
      getLocalStorageItem(generationCountKey) || "0"
    );
    const promptShown = getLocalStorageItem(promptShownKey);

    // Show sign up prompt after 2 generations, and dont show again until local storage expires
    if (!loggedIn && generationCount >= 2 && !promptShown) {
      loggedInOrModal({
        loginMessage: "Login to keep your generated audio history",
        signupMessage: "Sign up to keep your generated audio history",
      });
      setLocalStorageItem(promptShownKey, "true", ttl);
    }

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
      // @ts-ignore
      window.dataLayer.push({
        event: "enqueue_failure",
        page: "/tts",
        user_id: "$user_id",
      });
      console.error("Unexpected error:", error);
      setIsGenerating(false);
    }

    generationCount += 1;
    setLocalStorageItem(generationCountKey, generationCount.toString(), ttl);
  };

  return (
    <>
      <Container type="panel" className="mt-3 mt-lg-5">
        <Panel padding={true}>
          <form onSubmit={handleSpeak}>
            <h1 className="fw-bold fs-1 mb-0">{t("title.tts")}</h1>
            <p className="mb-4 opacity-75 fw-medium">{t("subtitle.tts")}</p>

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
                  <TextArea
                    autoFocus={selectedVoice ? true : false}
                    label={t("label.enterText")}
                    onChange={textChange}
                    value={text}
                    rows={isMobile ? 5 : 13}
                    placeholder={t("input.textPlaceholder", {
                      character: selectedVoice ? selectedVoice.title : "",
                    })}
                    resize={false}
                  />
                  <div className="d-flex justify-content-end gap-2">
                    <Button
                      icon={faDeleteLeft}
                      label={t("button.clear")}
                      disabled={!text}
                      variant="secondary"
                      onClick={() => setText("")}
                    />
                    <Button
                      icon={faWaveformLines}
                      label={t("button.speak")}
                      type="submit"
                      disabled={!selectedVoice || !text}
                      isLoading={isGenerating}
                    />
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="d-flex flex-column">
                    <Label label={t("label.output")} />
                    <div className="d-flex flex-column session-tts-section">
                      <SessionTtsInferenceResultList
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
