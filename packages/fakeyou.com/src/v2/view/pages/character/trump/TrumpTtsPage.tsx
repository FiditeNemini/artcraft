import React, { useEffect, useCallback, useState } from "react";
import { t } from "i18next";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { SessionTtsInferenceResultList } from "../../../_common/SessionTtsInferenceResultsList";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
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
import {
  ListTtsCategories,
  ListTtsCategoriesIsError,
  ListTtsCategoriesIsOk,
} from "@storyteller/components/src/api/category/ListTtsCategories";
import { TtsCategoryType } from "../../../../../AppWrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faDeleteLeft,
} from "@fortawesome/free-solid-svg-icons";

import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { Analytics } from "../../../../../common/Analytics";
import {
  GetComputedTtsCategoryAssignments,
  GetComputedTtsCategoryAssignmentsIsError,
  GetComputedTtsCategoryAssignmentsIsOk,
  GetComputedTtsCategoryAssignmentsSuccessResponse,
} from "@storyteller/components/src/api/category/GetComputedTtsCategoryAssignments";
import { DynamicallyCategorizeModels } from "../../../../../model/categories/SyntheticCategory";

import { usePrefixedDocumentTitle } from "../../../../../common/UsePrefixedDocumentTitle";
import { SearchOmnibar } from "./search/SearchOmnibar";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import PageHeaderWithImage from "components/layout/PageHeaderWithImage";
import { faVolumeHigh } from "@fortawesome/pro-solid-svg-icons";
import { Container, Panel } from "components/common";
import { useInferenceJobs } from "hooks";

const PAGE_MODEL_TOKENS = new Set<string>([
  "TM:pmd1wm3kf6az", // Development: "Fake Donald Trump #1"
  "TM:7rrwdhdq8ezq", // Development: "Fake Donald Trump #2"
  //"TM:aejrk66wq3ss", // Production: "Donald Trump (bibby's model)"
  "TM:pyzss4phqk6r", // Production: "Donald Trump (Sarcastic)"
  "TM:4v0ft4j72y2g", // Production: "Donald Trump (Angry)"
  "TM:03690khwpsbz", // Production: "Donald Trump (Casual Speech)"
]);

export interface EnqueueJobResponsePayload {
  success: boolean;
  inference_job_token?: string;
}

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;

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

function TrumpTtsPage(props: Props) {
  //Loading spinning icon\
  const { enqueueInferenceJob } = useInferenceJobs();
  const [loading, setLoading] = useState(false);
  const [isAudioLimitAlertVisible, setAudioLimitAlertVisible] = useState(false);
  PosthogClient.recordPageview();

  usePrefixedDocumentTitle("Donald Trump TTS and Donald Trump AI Voice");

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
        //let model = models[0];
        //const featuredModels = models.filter((m) => m.is_front_page_featured);
        //if (featuredModels.length > 0) {
        //  // Random featured model
        //  model =
        //    featuredModels[Math.floor(Math.random() * featuredModels.length)];
        //}

        let trumpModels = models.filter(model => {
          return PAGE_MODEL_TOKENS.has(model.model_token);
        });

        let model = trumpModels[Math.floor(Math.random() * trumpModels.length)];

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
        category => category.category_token === LATEST_MODELS_CATEGORY_TOKEN
      );

      let maybeTrendingCategory = categories.find(
        category => category.category_token === TRENDING_MODELS_CATEGORY_TOKEN
      );

      let otherCategories = categories
        .filter(
          category => category.category_token !== LATEST_MODELS_CATEGORY_TOKEN
        )
        .filter(
          category => category.category_token !== TRENDING_MODELS_CATEGORY_TOKEN
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
    setAudioLimitAlertVisible(textValue.length > 100);
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
      enqueueInferenceJob(
        response.inference_job_token,
        FrontendInferenceJobType.ImageGeneration
      );
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

  let audioLimitAlert = <></>;
  if (
    isAudioLimitAlertVisible &&
    !props.sessionSubscriptionsWrapper.hasPaidFeatures()
  ) {
    audioLimitAlert = (
      <>
        <div className="alert alert-warning fs-7 mb-0">
          <span className="fw-semibold">
            <u>Note:</u> Non-premium is limited to 12 seconds of audio.{" "}
            <Link className="fw-semibold" to="/pricing">
              Upgrade now
            </Link>
            .
          </span>
        </div>
      </>
    );
  }

  let trumpModels = props.ttsModels.filter(model => {
    return PAGE_MODEL_TOKENS.has(model.model_token);
  });

  let maybeSelectedModel = props.maybeSelectedTtsModel;

  if (
    maybeSelectedModel !== undefined &&
    !PAGE_MODEL_TOKENS.has(maybeSelectedModel.model_token)
  ) {
    // If we don't select a trump model by default (which is rare), the list will be empty.
    // We'll set it here.
    maybeSelectedModel = trumpModels[0];
  }

  return (
    <Container type="panel">
      <PageHeaderWithImage
        headerImage="/mascot/trump.webp"
        titleIcon={faVolumeHigh}
        title="Donald Trump TTS"
        subText="FakeYou has the very best Donald Trump AI voice on the internet. Use deep
        fake Donald Trump to say your favorite memes."
        yOffset="60%"
      />

      <Panel padding={true}>
        <i className="fas fa-volume-high"></i>

        <div className="d-flex gap-4">
          <form
            className="w-100 d-flex flex-column"
            onSubmit={handleFormSubmit}
          >
            {/* Explore Rollout */}
            <SearchOmnibar
              allTtsCategories={props.allTtsCategories}
              allTtsModels={trumpModels}
              allTtsCategoriesByTokenMap={props.allTtsCategoriesByTokenMap}
              allTtsModelsByTokenMap={props.allTtsModelsByTokenMap}
              ttsModelsByCategoryToken={props.ttsModelsByCategoryToken}
              dropdownCategories={props.dropdownCategories}
              setDropdownCategories={props.setDropdownCategories}
              selectedCategories={props.selectedCategories}
              setSelectedCategories={props.setSelectedCategories}
              maybeSelectedTtsModel={maybeSelectedModel}
              setMaybeSelectedTtsModel={props.setMaybeSelectedTtsModel}
              selectedTtsLanguageScope={props.selectedTtsLanguageScope}
              setSelectedTtsLanguageScope={props.setSelectedTtsLanguageScope}
            />
            {/*
                
                
                EXPLORE OMNIBAR GOES HERE TODO
                
                */}

            <div className="row gx-5 gy-5">
              <div className="col-12 col-lg-6 d-flex flex-column gap-3">
                <div className="d-flex flex-column gap-3 h-100">
                  <div className="d-flex gap-2">
                    <label className="sub-title pb-0">
                      {t("tts.TtsModelListPage.form.yourTextLabel")}
                    </label>
                  </div>
                  <textarea
                    onClick={() => {
                      Analytics.ttsClickTextInputBox();
                    }}
                    onChange={handleChangeText}
                    className="form-control text-message h-100"
                    value={props.textBuffer}
                    placeholder={t("tts.TtsModelListPage.form.textInputHint", {
                      voice: props.maybeSelectedTtsModel?.title || "the voice",
                    })}
                  ></textarea>
                  {audioLimitAlert}
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
                      <FontAwesomeIcon icon={faVolumeHigh} className="me-2" />
                      {t("tts.TtsModelListPage.form.buttons.speak")}

                      {loading && <LoadingIcon />}
                    </button>
                    <button
                      className="btn btn-destructive w-100"
                      onClick={handleClearClick}
                      disabled={noTextInputButtonDisabled}
                    >
                      <FontAwesomeIcon icon={faDeleteLeft} className="me-2" />
                      {t("tts.TtsModelListPage.form.buttons.clear")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="d-flex flex-column gap-3">
                  <h4 className="text-center text-lg-start">
                    <FontAwesomeIcon icon={faBarsStaggered} className="me-3" />
                    {t("tts.TtsModelListPage.sessionTtsResultsLabel")}
                  </h4>
                  <div className="d-flex flex-column gap-3 session-tts-section">
                    <SessionTtsInferenceResultList
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
      </Panel>
    </Container>
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

export { TrumpTtsPage };
