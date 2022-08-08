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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faVolumeHigh,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { GenericNotice } from "./notices/GenericNotice";
import { DiscordLink2 } from "@storyteller/components/src/elements/DiscordLink2";
import { motion } from "framer-motion";
import { container, item, image, panel } from "../../../../data/animation";

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

function TtsModelListPage(props: Props) {
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
        <Trans i18nKey="tts.TtsModelListPage.form.modelSeeMoreLink">
          See more details about the "
          <span className="fw-semibold">{{ modelName }}</span>" model by&nbsp;
          <span className="fw-semibold">{{ userName }}</span>&nbsp;
        </Trans>{" "}
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

  let signUpButton = <></>;

  if (!props.sessionWrapper.isLoggedIn()) {
    signUpButton = (
      <>
        <Link to="/signup">
          <button type="button" className="btn btn-primary w-100">
            {t("tts.TtsModelListPage.heroSection.buttons.signUp")}
          </button>
        </Link>
      </>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      {bootstrapLanguageNotice}

      {pleaseFollowNotice}

      {languageNotice}

      {vocodesNotice}

      {twitchTtsNotice}

      <div className="container hero-section">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <motion.img
                src="mascot/kitsune_pose2.webp"
                className="img-fluid"
                width="516"
                height="508"
                alt="FakeYou Mascot"
                variants={image}
              />
            </div>
          </div>
          <div className="col-lg-6 px-md-2 px-lg-5 px-xl-2">
            <div>
              <motion.h1
                className="display-2 fw-bold lh-1 mb-3 text-center text-lg-start"
                variants={item}
              >
                {t("tts.TtsModelListPage.heroSection.title")}
              </motion.h1>
              <motion.p
                className="lead mb-5 text-center text-lg-start pe-xl-2"
                variants={item}
              >
                <Trans i18nKey="tts.TtsModelListPage.heroSection.subtitle">
                  Use FakeYou's deepfake tech to say stuff with your favorite
                  characters.
                </Trans>
              </motion.p>
            </div>

            <motion.div
              className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-lg-start mb-5 mb-lg-4"
              variants={item}
            >
              {signUpButton}
              <Link to="/clone">
                <button type="button" className="btn btn-secondary w-100">
                  {t("tts.TtsModelListPage.heroSection.buttons.cloneVoice")}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

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

                {directViewLink}

                <div className="text-input">
                  <textarea
                    onChange={handleChangeText}
                    className="form-control fs-5"
                    style={{ minHeight: "200px" }}
                    value={props.textBuffer}
                    placeholder={t("tts.TtsModelListPage.form.textInputHint")}
                  ></textarea>
                </div>

                {maybeError}

                <div className="d-flex flex-column flex-md-row w-100 gap-3 mt-3">
                  <button
                    className="btn btn-primary w-100"
                    disabled={remainingCharactersButtonDisabled}
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} className="me-2" />
                    {t("tts.TtsModelListPage.form.buttons.speak")}
                  </button>
                  <button
                    className="btn btn-destructive w-100"
                    onClick={handleClearClick}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-2" />
                    {t("tts.TtsModelListPage.form.buttons.clear")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

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
    </motion.div>
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

export { TtsModelListPage };
