import React, { useState, useEffect, useCallback } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { t } from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import { container, panel } from "../../../../../data/animation";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { VcPageHero } from "./components/VcPageHero";
import Select, { createFilter } from "react-select";
import { SearchFieldClass } from "../../tts/tts_model_list/search/components/SearchFieldClass";
import {
  faBarsStaggered,
  faFiles,
  faHeadphones,
  faMicrophone,
  faRightLeft,
  faTrash,
} from "@fortawesome/pro-solid-svg-icons";
import UploadComponent from "./components/UploadComponent";
import RecordComponent from "./components/RecordComponent";
import { usePrefixedDocumentTitle } from "../../../../../common/UsePrefixedDocumentTitle";
import { ListVoiceConversionModels, VoiceConversionModelListItem } from "@storyteller/components/src/api/voice_conversion/ListVoiceConversionModels";
import { VcModelListSearch } from "./components/VcModelListSearch";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;

  voiceConversionModels: Array<VoiceConversionModelListItem>;
  setVoiceConversionModels: (ttsVoices: Array<VoiceConversionModelListItem>) => void;

  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
  setMaybeSelectedVoiceConversionModel: (maybeSelectedVoiceConversionModel: VoiceConversionModelListItem) => void;
}

function VcModelListPage(props: Props) {
  const [loading, setLoading] = useState(false);

  usePrefixedDocumentTitle("Voice Conversion");

  let {
    setVoiceConversionModels,
    voiceConversionModels,
    maybeSelectedVoiceConversionModel,
    setMaybeSelectedVoiceConversionModel,
  } = props;

  const ttsModelsLoaded = voiceConversionModels.length > 0;

  const listModels = useCallback(async () => {
    if (ttsModelsLoaded) {
      return; // Already queried.
    }
    const models = await ListVoiceConversionModels();
    if (models) {
      setVoiceConversionModels(models);
      if (!maybeSelectedVoiceConversionModel && models.length > 0) {
        let model = models[0];
        const featuredModels = models.filter((m) => m.is_front_page_featured);
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
    ttsModelsLoaded,
  ]);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    listModels();
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [
    handleLoading
  ]);

  const speakButtonClass = loading
    ? "btn btn-primary w-100 disabled"
    : "btn btn-primary w-100";

  const handleClearClick = (ev: React.FormEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    return false;
  };

  const handleFormSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
  };

  let noResultsSection = (
    <div className="panel panel-inner text-center p-5 rounded-5 h-100">
      <div className="d-flex flex-column opacity-75 h-100 justify-content-center">
        <FontAwesomeIcon icon={faHeadphones} className="fs-3 mb-3" />
        <h5 className="fw-semibold">
          {t("common.SessionTtsInferenceResults.noResults.title")}
        </h5>
        <p>{t("common.SessionTtsInferenceResults.noResults.subtitle")}</p>
      </div>
    </div>
  );

  // let comingSoon = (
  //   <div className="overflow-hidden">
  //     <div className="panel panel-inner text-center p-5 rounded-5 h-100">
  //       <div className="d-flex flex-column opacity-75 h-100 justify-content-center">
  //         <FontAwesomeIcon icon={faTimer} className="fs-3 mb-3" />
  //         <p>This feature is coming soon!</p>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <VcPageHero
        sessionWrapper={props.sessionWrapper}
        sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
      />

      <motion.div className="container-panel pb-5 mb-4" variants={panel}>
        <div className="panel p-3 py-4 p-md-4">
          <div className="d-flex gap-4">
            <form
              className="w-100 d-flex flex-column"
              onSubmit={handleFormSubmit}
            >
              {/* Explore Rollout */}
              <label className="sub-title">
                Choose Target Voice ({voiceConversionModels.length} to choose from)
              </label>
              <div className="input-icon-search pb-4">
                <span className="form-control-feedback">
                  <FontAwesomeIcon icon={faMicrophone} />
                </span>

                <VcModelListSearch
                  voiceConversionModels={props.voiceConversionModels}
                  setVoiceConversionModels={props.setVoiceConversionModels}
                  maybeSelectedVoiceConversionModel={props.maybeSelectedVoiceConversionModel}
                  setMaybeSelectedVoiceConversionModel={props.setMaybeSelectedVoiceConversionModel}
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
                        Pre-recorded
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
                        Microphone
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
                            Upload Input Audio
                          </label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            <UploadComponent />
                          </div>
                        </div>

                        <div>
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
                        </div>

                        <div className="d-flex gap-3">
                          <button
                            className={speakButtonClass}
                            onClick={handleLoading}
                            type="submit"
                            disabled={true}
                          >
                            <FontAwesomeIcon
                              icon={faRightLeft}
                              className="me-2"
                            />
                            Convert
                            {loading && <LoadingIcon />}
                          </button>
                          <button
                            className="btn btn-destructive w-100"
                            onClick={handleClearClick}
                            disabled={true}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                            Clear
                          </button>
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
                          <label className="sub-title">Record Audio</label>
                          <div className="d-flex flex-column gap-3 upload-component">
                            <RecordComponent />
                          </div>
                        </div>

                        <div className="d-flex gap-3">
                          <button
                            className={speakButtonClass}
                            onClick={handleLoading}
                            type="submit"
                            disabled={true}
                          >
                            <FontAwesomeIcon
                              icon={faRightLeft}
                              className="me-2"
                            />
                            Convert
                            {loading && <LoadingIcon />}
                          </button>
                          <button
                            className="btn btn-destructive w-100"
                            onClick={handleClearClick}
                            disabled={true}
                          >
                            <FontAwesomeIcon icon={faTrash} className="me-2" />
                            Clear
                          </button>
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
                      Session VC Results
                    </h4>
                    <div className="d-flex flex-column gap-3 session-tts-section">
                      {noResultsSection}
                      {/* <motion.div
                        className="panel panel-tts-results p-4 gap-3 d-flex flex-column"
                        variants={sessionItem}
                      >
                        <div>
                          <h5 className="mb-2">Title</h5>
                          <p>text</p>
                        </div>
                        (wavesurfer)
                        <div className="mt-2">
                          <Link to="/voice-conversion" className="fw-semibold">
                            <FontAwesomeIcon icon={faLink} className="me-2" />
                            Details
                          </Link>
                        </div>
                      </motion.div> */}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* <div className="pt-5">
          <BackLink link="/" text="Back to main page" />
        </div> */}
      </motion.div>
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

export { VcModelListPage };
