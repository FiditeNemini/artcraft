import React, { useEffect, useCallback, useState } from "react";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { SessionTtsInferenceResultList } from "../../../_common/SessionTtsInferenceResultsList";
import { SessionTtsModelUploadResultList } from "../../../_common/SessionTtsModelUploadResultsList";
import { SessionW2lInferenceResultList } from "../../../_common/SessionW2lInferenceResultsList";
import { SessionW2lTemplateUploadResultList } from "../../../_common/SessionW2lTemplateUploadResultsList";
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
} from "@storyteller/components/src/api/category/ListTtsCategories";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { SelectSearch } from "./search/SelectSearch";
import { LanguageNotice } from "./notices/LanguageNotice";
import { Language } from "@storyteller/components/src/i18n/Language";
import { TwitchTtsNotice } from "./notices/TwitchTtsNotice";
import { PleaseFollowNotice } from "./notices/PleaseFollowNotice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBarsStaggered,
  faCompass,
  faDeleteLeft,
  faGlobe,
  faStar,
  faThumbsDown,
  faThumbsUp,
  faVolumeHigh,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { GenericNotice } from "./notices/GenericNotice";
import { DiscordLink2 } from "@storyteller/components/src/elements/DiscordLink2";
import { motion } from "framer-motion";
import { container, panel } from "../../../../../data/animation";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { TtsPageHero } from "./TtsPageHero";
import { Analytics } from "../../../../../common/Analytics";
import {
  GetComputedTtsCategoryAssignments,
  GetComputedTtsCategoryAssignmentsIsError,
  GetComputedTtsCategoryAssignmentsIsOk,
  GetComputedTtsCategoryAssignmentsSuccessResponse,
} from "@storyteller/components/src/api/category/GetComputedTtsCategoryAssignments";
import { DynamicallyCategorizeModels } from "../../../../../model/categories/SyntheticCategory";
import {
  AvailableTtsLanguageKey,
  AVAILABLE_TTS_LANGUAGE_CATEGORY_MAP,
  ENGLISH_LANGUAGE,
} from "../../../../../_i18n/AvailableLanguageMap";
import { ExploreVoicesModal } from "./explore/ExploreVoicesModal";
import { WebUrl } from "../../../../../common/WebUrl";
import { usePrefixedDocumentTitle } from "../../../../../common/UsePrefixedDocumentTitle";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export interface EnqueueJobResponsePayload {
  success: boolean;
  inference_job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;

  isShowingVocodesNotice: boolean;
  clearVocodesNotice: () => void;

  isShowingLanguageNotice: boolean;
  clearLanguageNotice: () => void;
  displayLanguage: Language;

  isShowingTwitchTtsNotice: boolean;
  clearTwitchTtsNotice: () => void;

  isShowingPleaseFollowNotice: boolean;
  clearPleaseFollowNotice: () => void;

  isShowingBootstrapLanguageNotice: boolean;
  clearBootstrapLanguageNotice: () => void;

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

  computedTtsCategoryAssignments?: GetComputedTtsCategoryAssignmentsSuccessResponse;
  setComputedTtsCategoryAssignments: (
    categoryAssignments: GetComputedTtsCategoryAssignmentsSuccessResponse
  ) => void;

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;
  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;

  selectedTtsLanguageScope: string;
  setSelectedTtsLanguageScope: (selectedTtsLanguageScope: string) => void;
}

function TtsModelListPage(props: Props) {
  //Loading spinning icon
  const [loading, setLoading] = useState(false);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  let {
    setTtsModels,
    setAllTtsCategories,
    setComputedTtsCategoryAssignments,
    ttsModels,
    allTtsCategories,
    computedTtsCategoryAssignments,
    maybeSelectedTtsModel,
    setMaybeSelectedTtsModel,
  } = props;

  const [maybeTtsError, setMaybeTtsError] = useState<
    GenerateTtsAudioErrorType | undefined
  >(undefined);

  const ttsModelsLoaded = ttsModels.length > 0;
  const ttsCategoriesLoaded = allTtsCategories.length > 0;
  const computedTtsCategoryAssignmentsLoaded =
    computedTtsCategoryAssignments !== undefined &&
    computedTtsCategoryAssignments.category_token_to_tts_model_tokens.recursive
      .size > 0;

  const listModels = useCallback(async () => {
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListTtsModels();
    if (models) {
      DynamicallyCategorizeModels(models);
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
      let categories = categoryList.categories;

      // NB: We'll use the frontend to order the synthetic categories first.

      const LATEST_MODELS_CATEGORY_TOKEN = "SYNTHETIC_CATEGORY:LATEST_MODELS";
      const TRENDING_MODELS_CATEGORY_TOKEN =
        "SYNTHETIC_CATEGORY:TRENDING_MODELS";

      let maybeLatestCategory = categories.find(
        (category) => category.category_token === LATEST_MODELS_CATEGORY_TOKEN
      );

      let maybeTrendingCategory = categories.find(
        (category) => category.category_token === TRENDING_MODELS_CATEGORY_TOKEN
      );

      let otherCategories = categories
        .filter(
          (category) => category.category_token !== LATEST_MODELS_CATEGORY_TOKEN
        )
        .filter(
          (category) =>
            category.category_token !== TRENDING_MODELS_CATEGORY_TOKEN
        );

      categories = [];

      if (maybeLatestCategory !== undefined) {
        categories.push(maybeLatestCategory);
      }

      if (maybeTrendingCategory !== undefined) {
        categories.push(maybeTrendingCategory);
      }

      categories.push(...otherCategories);

      setAllTtsCategories(categories);
    } else if (ListTtsCategoriesIsError(categoryList)) {
      // TODO: Retry on decay function
    }
  }, [setAllTtsCategories, ttsCategoriesLoaded]);

  const getComputedAssignments = useCallback(async () => {
    if (computedTtsCategoryAssignmentsLoaded) {
      return; // Already queried.
    }
    const computedAssignments = await GetComputedTtsCategoryAssignments();
    if (GetComputedTtsCategoryAssignmentsIsOk(computedAssignments)) {
      setComputedTtsCategoryAssignments(computedAssignments);
    } else if (GetComputedTtsCategoryAssignmentsIsError(computedAssignments)) {
      // TODO: Retry on decay function
    }
  }, [setComputedTtsCategoryAssignments, computedTtsCategoryAssignmentsLoaded]);

  useEffect(() => {
    listModels();
    listTtsCategories();
    getComputedAssignments();
  }, [listModels, listTtsCategories, getComputedAssignments]);

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

    Analytics.ttsGenerate(modelToken, props.textBuffer.length);

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

    Analytics.ttsClear(props.maybeSelectedTtsModel?.model_token);

    return false;
  };

  let directViewLink = <span />;

  if (props.maybeSelectedTtsModel) {
    const userName = props.maybeSelectedTtsModel.creator_display_name;
    const modelLink = WebUrl.ttsModelPage(
      props.maybeSelectedTtsModel.model_token
    );
    const profileLink = WebUrl.userProfilePage(
      props.maybeSelectedTtsModel.creator_display_name
    );
    const modelLanguage =
      AVAILABLE_TTS_LANGUAGE_CATEGORY_MAP[
        props.maybeSelectedTtsModel
          .ietf_primary_language_subtag as AvailableTtsLanguageKey
      ] || ENGLISH_LANGUAGE;

    directViewLink = (
      <div className="d-flex flex-column direct-view-link zi-2 mb-4">
        <div className="d-flex flex-column gap-3 flex-lg-row">
          <p className="flex-grow-1">
            {t("tts.TtsModelListPage.voiceDetails.voiceBy")}{" "}
            <Link
              to={profileLink}
              onClick={() => {
                Analytics.ttsClickModelCreatorLink();
              }}
              className="fw-medium"
            >
              {userName}{" "}
              <Gravatar
                size={20}
                username={props.maybeSelectedTtsModel.creator_display_name}
                email_hash={props.maybeSelectedTtsModel.creator_gravatar_hash}
              />
            </Link>{" "}
            | <FontAwesomeIcon icon={faGlobe} className="me-2" />
            {t("tts.TtsModelListPage.languageLabel")}:{" "}
            <span className="fw-medium">{modelLanguage.languageName}</span>{" "}
            {/*| Use count:{" "}
            <span className="fw-semibold">616400</span>*/}
            | Used <span className="fw-medium">308,270 times</span>
          </p>
          <Link
            to={modelLink}
            onClick={() => {
              Analytics.ttsClickModelDetailsLink();
            }}
            className="d-flex align-items-center"
          >
            <span className="fw-medium">
              {t("tts.TtsModelListPage.voiceDetails.seeMoreDetails")}
            </span>
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Link>
        </div>
        <hr />
        <div className="d-flex gap-3">
          <div className="d-flex">
            <Tippy
              content="This voice sounds good"
              hideOnClick
              placement="bottom"
              theme="fakeyou"
              arrow={false}
            >
              <button className="btn-rate left rated">
                <FontAwesomeIcon icon={faThumbsUp} />
              </button>
            </Tippy>

            <div className="vr"></div>

            <Tippy
              content="This voice sounds bad"
              hideOnClick
              placement="bottom"
              theme="fakeyou"
              arrow={false}
            >
              <button className="btn-rate right">
                <FontAwesomeIcon icon={faThumbsDown} />
              </button>
            </Tippy>
          </div>
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faStar} className="me-2 rating-icon" />
            <p>
              Rating: <span className="fw-medium">4.5 — Great</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  usePrefixedDocumentTitle(undefined); // NB: Sets to default title

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

  let dollars = "$150 USD";

  const bootstrapLanguageNotice = props.isShowingBootstrapLanguageNotice ? (
    <GenericNotice
      title={t("notices.HelpBootstrapLanguage.title")}
      body={
        <Trans i18nKey="notices.HelpBootstrapLanguage.body">
          We don't have enough voices in this language yet. Please help us build
          your favorite characters. Join our <DiscordLink2 /> and we'll teach
          you how. We'll pay {dollars} you per voice, too!
        </Trans>
      }
      clearNotice={props.clearBootstrapLanguageNotice}
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
        <div
          className="alert alert-primary alert-dismissible fade show m-0"
          role="alert"
        >
          <button
            className="btn-close"
            onClick={() => setMaybeTtsError(undefined)}
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
          {message}
        </div>
      );
    }
  }

  // NB: If the text is too long, don't allow submission
  let remainingCharactersButtonDisabled = props.textBuffer.trim().length > 1024;
  let noTextInputButtonDisabled = props.textBuffer.trim() === "";

  const speakButtonClass = loading
    ? "btn btn-primary w-100 disabled"
    : "btn btn-primary w-100";

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {bootstrapLanguageNotice}

      {pleaseFollowNotice}

      {languageNotice}

      {vocodesNotice}

      {twitchTtsNotice}

      <TtsPageHero
        sessionWrapper={props.sessionWrapper}
        sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
      />

      <motion.div className="container-panel pt-4 pb-5 mb-4" variants={panel}>
        <div className="panel p-3 p-lg-4 mt-5 mt-lg-0">
          <i className="fas fa-volume-high"></i>
          <h1 className="panel-title fw-bold">
            <FontAwesomeIcon icon={faVolumeUp} className="me-3" />
            {t("tts.TtsModelListPage.formTitle")}
          </h1>
          <div className="py-6">
            <div className="d-flex gap-4">
              <form
                className="w-100 d-flex flex-column gap-4"
                onSubmit={handleFormSubmit}
              >
                <div>
                  <div className="d-flex gap-2">
                    <label className="sub-title">
                      {t("tts.TtsModelListPage.form.searchBarLabel")}
                    </label>
                    {/*<a href="/" className="ms-1">
                      <FontAwesomeIcon icon={faShuffle} />
                    </a>*/}
                  </div>

                  <div className="d-flex flex-column flex-lg-row gap-3 ">
                    <div className="flex-grow-1">
                      <SelectSearch
                        allTtsCategories={props.allTtsCategories}
                        allTtsModels={props.ttsModels}
                        allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
                        dropdownCategories={props.dropdownCategories}
                        setDropdownCategories={props.setDropdownCategories}
                        selectedCategories={props.selectedCategories}
                        setSelectedCategories={props.setSelectedCategories}
                        maybeSelectedTtsModel={props.maybeSelectedTtsModel}
                        setMaybeSelectedTtsModel={
                          props.setMaybeSelectedTtsModel
                        }
                        selectedTtsLanguageScope={
                          props.selectedTtsLanguageScope
                        }
                      />
                    </div>

                    <button
                      onClick={() => {
                        Analytics.ttsOpenExploreVoicesModal();
                      }}
                      className="btn btn-primary rounded-50"
                      data-bs-toggle="modal"
                      data-bs-target="#exploreModal"
                      type="button"
                    >
                      <FontAwesomeIcon icon={faCompass} className="me-2" />
                      {t(
                        "tts.TtsModelListPage.exploreModal.exploreModalOpenButton"
                      )}
                    </button>
                  </div>
                </div>

                {/* Explore Modal */}
                <ExploreVoicesModal
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
                  selectedTtsLanguageScope={props.selectedTtsLanguageScope}
                  setSelectedTtsLanguageScope={
                    props.setSelectedTtsLanguageScope
                  }
                />

                {directViewLink}

                <div className="row gx-5 gy-5">
                  <div className="col-12 col-lg-6 d-flex flex-column gap-3">
                    <div className="d-flex flex-column gap-3 h-100">
                      <div className="d-flex gap-2">
                        <label className="sub-title pb-0">
                          {t("tts.TtsModelListPage.form.yourTextLabel")}
                        </label>
                        {/*<a href="/" className="ms-1">
                          <FontAwesomeIcon icon={faShuffle} />
                        </a>*/}
                      </div>
                      <textarea
                        onClick={() => {
                          Analytics.ttsClickTextInputBox();
                        }}
                        onChange={handleChangeText}
                        className="form-control text-message h-100"
                        value={props.textBuffer}
                        placeholder={t(
                          "tts.TtsModelListPage.form.textInputHint"
                        )}
                      ></textarea>
                      <div className="d-flex gap-3">
                        <button
                          className={speakButtonClass}
                          disabled={
                            remainingCharactersButtonDisabled ||
                            noTextInputButtonDisabled
                          }
                          onClick={handleLoading}
                          type="submit"
                        >
                          <FontAwesomeIcon
                            icon={faVolumeHigh}
                            className="me-2"
                          />
                          {t("tts.TtsModelListPage.form.buttons.speak")}

                          {loading && <LoadingIcon />}
                        </button>
                        <button
                          className="btn btn-destructive w-100"
                          onClick={handleClearClick}
                          disabled={noTextInputButtonDisabled}
                        >
                          <FontAwesomeIcon
                            icon={faDeleteLeft}
                            className="me-2"
                          />
                          {t("tts.TtsModelListPage.form.buttons.clear")}
                        </button>
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
                        {t("tts.TtsModelListPage.sessionTtsResultsLabel")}
                      </h4>
                      <div className="d-flex flex-column gap-3 session-tts-section">
                        <SessionTtsInferenceResultList
                          ttsInferenceJobs={props.ttsInferenceJobs}
                          sessionSubscriptionsWrapper={
                            props.sessionSubscriptionsWrapper
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {maybeError}
              </form>
            </div>
          </div>
        </div>

        {/* <div className="pt-5">
          <BackLink link="/" text="Back to main page" />
        </div> */}
      </motion.div>

      <SessionW2lInferenceResultList
        w2lInferenceJobs={props.w2lInferenceJobs}
      />

      <SessionW2lTemplateUploadResultList
        w2lTemplateUploadJobs={props.w2lTemplateUploadJobs}
      />

      <SessionTtsModelUploadResultList
        modelUploadJobs={props.ttsModelUploadJobs}
      />
    </motion.div>
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

export { TtsModelListPage };
