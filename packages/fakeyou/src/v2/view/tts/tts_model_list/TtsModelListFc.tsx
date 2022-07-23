import React, { useEffect, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { SessionTtsInferenceResultListFc } from "../../_common/SessionTtsInferenceResultsListFc";
import { SessionTtsModelUploadResultListFc } from "../../_common/SessionTtsModelUploadResultsListFc";
import { SessionW2lInferenceResultListFc } from "../../_common/SessionW2lInferenceResultsListFc";
import { SessionW2lTemplateUploadResultListFc } from "../../_common/SessionW2lTemplateUploadResultsListFc";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Gravatar } from "@storyteller/components/src/elements/Gravatar";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { W2lInferenceJob } from "@storyteller/components/src/jobs/W2lInferenceJobs";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { v4 as uuidv4 } from "uuid";
import {
  ListTtsModels,
  TtsModelListItem,
} from "@storyteller/components/src/api/tts/ListTtsModels";
import {
  GenerateTtsAudio,
  GenerateTtsAudioErrorType,
  GenerateTtsAudioIsError,
  GenerateTtsAudioIsOk,
} from "@storyteller/components/src/api/tts/GenerateTtsAudio";
import { VocodesNotice } from "./notices/VocodesNotice";
import {
  ListTtsCategories,
  ListTtsCategoriesIsError,
  ListTtsCategoriesIsOk,
} from "../../../api/category/ListTtsCategories";
import { MultiDropdownSearch } from "./MultiDropdownSearch";
import { SyntheticCategory, TtsCategoryType } from "../../../../AppWrapper";
import { AutocompleteSearch } from "./AutocompleteSearch";
import { LanguageNotice } from "./notices/LanguageNotice";
import { Language } from "@storyteller/components/src/i18n/Language";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { TwitchTtsNotice } from "./notices/TwitchTtsNotice";
import { PleaseFollowNotice } from "./notices/PleaseFollowNotice";
import { distance, delay, delay2, duration } from "../../../../data/animation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faVolumeHigh,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { USE_REFRESH } from "../../../../Refresh";

const Fade = require("react-reveal/Fade");

export interface EnqueueJobResponsePayload {
  success: boolean;
  inference_job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;

  isShowingVocodesNotice: boolean;
  clearVocodesNotice: () => void;

  isShowingLanguageNotice: boolean;
  clearLanguageNotice: () => void;
  displayLanguage: Language;

  isShowingTwitchTtsNotice: boolean;
  clearTwitchTtsNotice: () => void;

  isShowingPleaseFollowNotice: boolean;
  clearPleaseFollowNotice: () => void;

  enqueueTtsJob: (jobToken: string) => void;
  ttsInferenceJobs: Array<TtsInferenceJob>;
  ttsModelUploadJobs: Array<TtsModelUploadJob>;
  w2lInferenceJobs: Array<W2lInferenceJob>;
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;
  textBuffer: string;
  setTextBuffer: (textBuffer: string) => void;
  clearTextBuffer: () => void;

  ttsModels: Array<TtsModelListItem>;
  setTtsModels: (ttsVoices: Array<TtsModelListItem>) => void;

  allTtsCategories: TtsCategoryType[];
  setAllTtsCategories: (allTtsCategories: TtsCategoryType[]) => void;

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;
  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;
}

function TtsModelListFc(props: Props) {
  let {
    setTtsModels,
    setAllTtsCategories,
    ttsModels,
    allTtsCategories,
    maybeSelectedTtsModel,
    setMaybeSelectedTtsModel,
  } = props;

  const [maybeTtsError, setMaybeTtsError] = useState<
    GenerateTtsAudioErrorType | undefined
  >(undefined);

  const ttsModelsLoaded = ttsModels.length > 0;
  const ttsCategoriesLoaded = allTtsCategories.length > 0;

  const listModels = useCallback(async () => {
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListTtsModels();
    if (models) {
      dynamicallyCategorizeModels(models);
      setTtsModels(models);
      if (!maybeSelectedTtsModel && models.length > 0) {
        let model = models[0];
        const featuredModels = models.filter((m) => m.is_front_page_featured);
        if (featuredModels.length > 0) {
          // Random featured model
          model =
            featuredModels[Math.floor(Math.random() * featuredModels.length)];
        }
        setMaybeSelectedTtsModel(model);
      }
    }
  }, [
    setTtsModels,
    maybeSelectedTtsModel,
    setMaybeSelectedTtsModel,
    ttsModelsLoaded,
  ]);

  const listTtsCategories = useCallback(async () => {
    if (ttsCategoriesLoaded) {
      return; // Already queried.
    }
    const categoryList = await ListTtsCategories();
    if (ListTtsCategoriesIsOk(categoryList)) {
      const serverCategories: TtsCategoryType[] = categoryList.categories;
      const dynamicCategories: TtsCategoryType[] =
        generateSyntheticCategories();
      const allCategories = serverCategories.concat(dynamicCategories);
      setAllTtsCategories(allCategories);
    } else if (ListTtsCategoriesIsError(categoryList)) {
      // TODO: Retry on decay function
    }
  }, [setAllTtsCategories, ttsCategoriesLoaded]);

  useEffect(() => {
    listModels();
    listTtsCategories();
  }, [listModels, listTtsCategories]);

  // TODO: I never did anything with this.
  let remainingCharactersButtonDisabled = false;

  const handleChangeText = (ev: React.FormEvent<HTMLTextAreaElement>) => {
    const textValue = (ev.target as HTMLTextAreaElement).value;
    props.setTextBuffer(textValue);
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (!props.maybeSelectedTtsModel) {
      return false;
    }

    if (!props.textBuffer) {
      return false;
    }

    const modelToken = props.maybeSelectedTtsModel!.model_token;

    const request = {
      uuid_idempotency_token: uuidv4(),
      tts_model_token: modelToken,
      inference_text: props.textBuffer,
    };

    const response = await GenerateTtsAudio(request);

    if (GenerateTtsAudioIsOk(response)) {
      setMaybeTtsError(undefined);
      props.enqueueTtsJob(response.inference_job_token);
    } else if (GenerateTtsAudioIsError(response)) {
      setMaybeTtsError(response.error);
    }

    return false;
  };

  const handleClearClick = (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();
    props.clearTextBuffer();
    return false;
  };

  let directViewLink = <span />;

  if (props.maybeSelectedTtsModel) {
    let modelLink = `/tts/${props.maybeSelectedTtsModel.model_token}`;
    let modelName = props.maybeSelectedTtsModel.title;
    let userName = props.maybeSelectedTtsModel.creator_display_name;
    directViewLink = (
      <Link to={modelLink} className="py-2">
        <Trans i18nKey="ttsListPage.seeModelDetails">
          See more details about the "
          <span className="fw-semibold">{{ modelName }}</span>" model by&nbsp;
          <span className="fw-semibold">{{ userName }}</span>&nbsp;
        </Trans>
        <Gravatar
          size={15}
          username={props.maybeSelectedTtsModel.creator_display_name}
          email_hash={props.maybeSelectedTtsModel.creator_gravatar_hash}
        />
      </Link>
    );
  }

  const vocodesNotice = props.isShowingVocodesNotice ? (
    <VocodesNotice clearVocodesNotice={props.clearVocodesNotice} />
  ) : undefined;

  const languageNotice = props.isShowingLanguageNotice ? (
    <LanguageNotice
      clearLanguageNotice={props.clearLanguageNotice}
      displayLanguage={props.displayLanguage}
    />
  ) : undefined;

  const twitchTtsNotice = props.isShowingTwitchTtsNotice ? (
    <TwitchTtsNotice clearTwitchTtsNotice={props.clearTwitchTtsNotice} />
  ) : undefined;

  const pleaseFollowNotice = props.isShowingPleaseFollowNotice ? (
    <PleaseFollowNotice
      clearPleaseFollowNotice={props.clearPleaseFollowNotice}
    />
  ) : undefined;

  // Show errors on TTS failure
  let maybeError = <></>;
  if (!!maybeTtsError) {
    let hasMessage = false;
    let message = <></>;
    switch (maybeTtsError) {
      case GenerateTtsAudioErrorType.TooManyRequests:
        hasMessage = true;
        message = (
          <Trans i18nKey="pages.ttsList.errorTooManyRequests">
            <strong>You're sending too many requests!</strong>
            Slow down a little. We have to slow things down a little when the
            server gets busy.
          </Trans>
        );
        break;
      case GenerateTtsAudioErrorType.ServerError |
        GenerateTtsAudioErrorType.BadRequest |
        GenerateTtsAudioErrorType.NotFound:
        break;
    }

    if (hasMessage) {
      maybeError = (
        <div className="alert alert-warning m-0">
          <button className="close" onClick={() => setMaybeTtsError(undefined)}>
            <span aria-hidden="true">&times;</span>
          </button>
          {message}
        </div>
      );
    }
  }

  if (!USE_REFRESH) {
    return (
      <div>
        <section className="hero is-small">
          <div className="hero-body">
            <div className="columns is-vcentered">
              <div className="column is-one-third">
                <div className="mascot">
                  <img
                    src="/mascot/kitsune_pose2_black_2000.webp"
                    alt="FakeYou's mascot!"
                  />
                </div>
              </div>

              <div className="column">
                <p className="title">{t("pages.ttsList.heroTitle")}</p>
                <p className="subtitle">
                  <Trans i18nKey="pages.ttsList.heroSubtitle">
                    Use <strong>FakeYou</strong> deep fake tech to say stuff
                    with your favorite characters.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </section>

        <br />

        {pleaseFollowNotice}

        {languageNotice}

        {vocodesNotice}

        {twitchTtsNotice}

        <form onSubmit={handleFormSubmit} className="main-form">
          <MultiDropdownSearch
            allTtsCategories={props.allTtsCategories}
            allTtsModels={props.ttsModels}
            allTtsCategoriesByTokenMap={props.allTtsCategoriesByTokenMap}
            allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
            ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
            dropdownCategories={props.dropdownCategories}
            setDropdownCategories={props.setDropdownCategories}
            selectedCategories={props.selectedCategories}
            setSelectedCategories={props.setSelectedCategories}
            maybeSelectedTtsModel={props.maybeSelectedTtsModel}
            setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
          />

          <AutocompleteSearch
            allTtsCategories={props.allTtsCategories}
            allTtsModels={props.ttsModels}
            allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
            dropdownCategories={props.dropdownCategories}
            setDropdownCategories={props.setDropdownCategories}
            selectedCategories={props.selectedCategories}
            setSelectedCategories={props.setSelectedCategories}
            maybeSelectedTtsModel={props.maybeSelectedTtsModel}
            setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
          />

          <div>{directViewLink}</div>

          <div className="field">
            <div className="control">
              <textarea
                onChange={handleChangeText}
                className="textarea is-large"
                value={props.textBuffer}
                placeholder={t("pages.ttsList.placeholderTextGoesHere")}
              ></textarea>
            </div>
          </div>

          {maybeError}

          <div className="button-group">
            <div className="columns is-mobile">
              <div className="column has-text-centered">
                <button
                  className="button is-danger is-large"
                  disabled={remainingCharactersButtonDisabled}
                >
                  {t("pages.ttsList.buttonSpeak")}
                </button>
              </div>
              <div className="column has-text-centered">
                <button
                  className="button is-danger is-light is-large"
                  onClick={handleClearClick}
                >
                  {t("pages.ttsList.buttonClear")}
                </button>
              </div>
            </div>
          </div>
        </form>

        <br />
        <br />
        <SessionTtsInferenceResultListFc
          ttsInferenceJobs={props.ttsInferenceJobs}
        />

        <br />
        <br />

        <SessionW2lInferenceResultListFc
          w2lInferenceJobs={props.w2lInferenceJobs}
        />
        <br />
        <br />

        <SessionW2lTemplateUploadResultListFc
          w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
        />

        <br />
        <br />

        <SessionTtsModelUploadResultListFc
          modelUploadJobs={props.ttsModelUploadJobs}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="container hero-section">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <Fade right distance={distance} delay={delay} duration={duration}>
                <img
                  src="mascot/kitsune_pose2.png"
                  className="ani4 load-hidden img-fluid"
                  width="560"
                  loading="lazy"
                  alt="FakeYou Mascot"
                />
              </Fade>
            </div>
          </div>
          <div className="col-lg-6 px-md-2 px-lg-5 px-xl-2">
            <Fade bottom cascade duration={duration} distance={distance}>
              <div>
                <h1 className="display-3 fw-bold lh-1 mb-3 text-center text-lg-start">
                  Text to Speech
                </h1>
                <p className="lead mb-5 text-center text-lg-start pe-xl-2">
                  <Trans i18nKey="pages.ttsList.heroSubtitle">
                    Use FakeYou's deepfake tech to say stuff with your favorite
                    characters.
                  </Trans>
                </p>
              </div>
            </Fade>

            <Fade bottom delay={delay} duration={duration} distance={distance}>
              <div className="d-grid gap-3 d-lg-flex justify-content-lg-start mb-4">
                <Link to="/">
                  <button type="button" className="btn btn-primary w-100">
                    Sign Up
                  </button>
                </Link>
                <Link to="/clone">
                  <button type="button" className="btn btn-secondary w-100">
                    Clone My Voice!
                  </button>
                </Link>
              </div>
            </Fade>
          </div>
        </div>
      </div>

      {pleaseFollowNotice}

      {languageNotice}

      {vocodesNotice}

      {twitchTtsNotice}

      <div className="container-panel pt-4 pb-5 mb-4">
        <Fade bottom distance={distance} delay={delay2} duration={duration}>
          <div className="panel p-3 p-lg-4 mt-5 mt-lg-0">
            <i className="fas fa-volume-high"></i>
            <h1 className="panel-title fw-bold">
              <FontAwesomeIcon icon={faVolumeUp} className="me-3" />
              Create TTS
            </h1>
            <div className="py-6">
              <div className="d-flex gap-4">
                <form
                  className="w-100 d-flex flex-column gap-4"
                  onSubmit={handleFormSubmit}
                >
                  <MultiDropdownSearch
                    allTtsCategories={props.allTtsCategories}
                    allTtsModels={props.ttsModels}
                    allTtsCategoriesByTokenMap={
                      props.allTtsCategoriesByTokenMap
                    }
                    allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
                    ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
                    dropdownCategories={props.dropdownCategories}
                    setDropdownCategories={props.setDropdownCategories}
                    selectedCategories={props.selectedCategories}
                    setSelectedCategories={props.setSelectedCategories}
                    maybeSelectedTtsModel={props.maybeSelectedTtsModel}
                    setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
                  />

                  <AutocompleteSearch
                    allTtsCategories={props.allTtsCategories}
                    allTtsModels={props.ttsModels}
                    allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
                    dropdownCategories={props.dropdownCategories}
                    setDropdownCategories={props.setDropdownCategories}
                    selectedCategories={props.selectedCategories}
                    setSelectedCategories={props.setSelectedCategories}
                    maybeSelectedTtsModel={props.maybeSelectedTtsModel}
                    setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
                  />

                  {directViewLink}

                  <div className="text-input">
                    <textarea
                      onChange={handleChangeText}
                      className="form-control fs-5"
                      style={{ minHeight: "200px" }}
                      value={props.textBuffer}
                      placeholder={t("pages.ttsList.placeholderTextGoesHere")}
                    ></textarea>
                  </div>

                  {maybeError}

                  <div className="d-flex flex-column flex-lg-row w-100 gap-3 mt-3">
                    <button
                      className="btn btn-primary w-100"
                      disabled={remainingCharactersButtonDisabled}
                    >
                      <FontAwesomeIcon icon={faVolumeHigh} className="me-2" />
                      {t("pages.ttsList.buttonSpeak")}
                    </button>
                    <button
                      className="btn btn-destructive w-100"
                      onClick={handleClearClick}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      {t("pages.ttsList.buttonClear")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Fade>
      </div>

      <SessionTtsInferenceResultListFc
        ttsInferenceJobs={props.ttsInferenceJobs}
      />

      <SessionW2lInferenceResultListFc
        w2lInferenceJobs={props.w2lInferenceJobs}
      />

      <SessionW2lTemplateUploadResultListFc
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
      />

      <SessionTtsModelUploadResultListFc
        modelUploadJobs={props.ttsModelUploadJobs}
      />
      <br />
    </div>
  );
}

function generateSyntheticCategories(): SyntheticCategory[] {
  return [
    // Under-categorized
    new SyntheticCategory("Under-categorized Models", "syn:under"),
    new SyntheticCategory(
      "With 0 categories",
      "syn:uncategorized",
      "syn:under"
    ),
    new SyntheticCategory("With 1 category", "syn:one-category", "syn:under"),
    // Most recent
    new SyntheticCategory("Most Recent Voices", "syn:most-recent"),
  ];
}

// Directly mutate the model records
function dynamicallyCategorizeModels(models: TtsModelListItem[]) {
  // NB: Sorting by creation date will involve more refactoring, so this is fine for now.
  const mostRecentModelTokens = new Set(
    [...models]
      .sort((modelA, modelB) => {
        const dateA = new Date(modelA.created_at);
        const dateB = new Date(modelB.created_at);
        if (dateA > dateB) {
          return -1;
        } else if (dateA < dateB) {
          return 1;
        } else {
          return 0;
        }
      })
      .map((model) => model.model_token)
      .slice(0, 25)
  );

  models.forEach((model) => {
    if (!model.category_tokens) {
      model.category_tokens = [];
    }
    if (model.category_tokens.length === 1) {
      model.category_tokens.push("syn:one-category");
    } else if (model.category_tokens.length === 0) {
      model.category_tokens.push("syn:uncategorized");
    }

    if (mostRecentModelTokens.has(model.model_token)) {
      model.category_tokens.push("syn:most-recent");
    }
  });
}

export { TtsModelListFc };
