import React from "react";
import { ApiConfig } from "@storyteller/components";
import {
  DetectLocale,
  DetectLocaleIsOk,
} from "@storyteller/components/src/api/locale/DetectLocale";
import { Language } from "@storyteller/components/src/i18n/Language";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { NewVocodesContainer } from "./v2/view/NewVocodesContainer";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import {
  TtsInferenceJob,
  TtsInferenceJobStateResponsePayload,
} from "@storyteller/components/src/jobs/TtsInferenceJobs";
import {
  W2lInferenceJob,
  W2lInferenceJobStateResponsePayload,
} from "@storyteller/components/src/jobs/W2lInferenceJobs";
import {
  TtsModelUploadJob,
  TtsModelUploadJobStateResponsePayload,
} from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import {
  W2lTemplateUploadJob,
  W2lTemplateUploadJobStateResponsePayload,
} from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { jobStateCanChange } from "@storyteller/components/src/jobs/JobStates";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { TtsCategoryType } from "./AppWrapper";
import { FAKEYOU_MERGED_TRANSLATIONS } from "./_i18n/FakeYouTranslations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ParticlesBG from "./Particles";
import { USE_REFRESH } from "./Refresh";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: FAKEYOU_MERGED_TRANSLATIONS,
    //lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    // For finding 'Trans' component keys.
    debug: false,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

enum MigrationMode {
  NEW_VOCODES,
  OLD_VOCODES,
}

interface Props {
  enableSpectrograms: boolean;

  flashVocodesNotice: boolean;

  allTtsCategories: TtsCategoryType[];
  setAllTtsCategories: (allTtsCategories: TtsCategoryType[]) => void;

  allTtsModels: TtsModelListItem[];
  setAllTtsModels: (allTtsModels: TtsModelListItem[]) => void;

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

interface State {
  // Migration Mode
  migrationMode: MigrationMode;

  // Rollout of vocodes 2.0
  enableAlpha: boolean;
  sessionWrapper: SessionWrapper;

  // Show flash notice of vocodes name change
  isShowingVocodesNotice: boolean;

  // Locale + show flash notice to Spanish speakers
  //localeLanguageCodes: string[],
  //localeFullLanguageTags: string[],
  isShowingLanguageNotice: boolean;
  displayLanguage: Language;
  primaryLanguageCode: string;

  isShowingTwitchTtsNotice: boolean;
  isShowingPleaseFollowNotice: boolean;

  // Jobs enqueued during this browser session.
  ttsInferenceJobs: Array<TtsInferenceJob>;
  w2lInferenceJobs: Array<W2lInferenceJob>;
  ttsModelUploadJobs: Array<TtsModelUploadJob>;
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;

  // Current text entered
  textBuffer: string;
}

function newVocodes() {
  const discord = /discord/i.test(navigator.userAgent || "");
  const twitter = /twitter/i.test(navigator.userAgent || "");
  const alphaCookie = document.cookie.includes("enable-alpha");
  return discord || twitter || alphaCookie;
}

function isMacOs() {
  // Not on macs yet
  // https://stackoverflow.com/a/38241481
  const platform = window.navigator.platform;
  const macPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K", "darwin"];
  return macPlatforms.indexOf(platform) !== -1;
}

// TODO: Port to functional component
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const enableAlpha = newVocodes() || true;

    const migrationMode = enableAlpha
      ? MigrationMode.NEW_VOCODES
      : MigrationMode.OLD_VOCODES;

    let showTwitchNotice = !isMacOs();
    showTwitchNotice = false; // TODO: Temporarily disabled.

    let showPleaseFollowNotice = false;

    this.state = {
      enableAlpha: enableAlpha,
      migrationMode: migrationMode,
      sessionWrapper: SessionWrapper.emptySession(),

      isShowingVocodesNotice: props.flashVocodesNotice,

      //localeLanguageCodes: [],
      //localeFullLanguageTags: [],
      isShowingLanguageNotice: false,
      displayLanguage: Language.English,
      primaryLanguageCode: "en",

      isShowingTwitchTtsNotice: showTwitchNotice,
      isShowingPleaseFollowNotice: showPleaseFollowNotice,

      ttsInferenceJobs: [],
      w2lInferenceJobs: [],
      ttsModelUploadJobs: [],
      w2lTemplateUploadJobs: [],

      textBuffer: "",
    };
  }

  componentWillMount() {
    // Handle redesign
    console.log('componentWillMount', 'useRefresh?', USE_REFRESH);

    if (USE_REFRESH) {
      // Redesign-specific CSS
      // NB(echelon): Despite the branches here, scss is all combined together at compile time 
      // in staging and production (not development). To handle those environments, styles are 
      // additionally applied based on the root "fakeyou-refresh" class, which may have changed 
      // some of the specificity rules of Bootstrap.
      require("./AppNew.scss");
    } else {
      // Old design CSS
      // NB(echelon): Despite the branches here, scss is all combined together at compile time
      // in staging and production (not development). To handle those environments, styles are 
      // additionally applied based on the root "fakeyou-old" class, which may have changed some 
      // of the specificity rules of Bulma.
      require("./AppOld.scss");
      require("./v2/view/_css/footer.scss");
    }
  }

  async componentDidMount() {
    await this.querySession();
    await this.queryLanguage();

    setInterval(async () => {
      await this.querySession();
    }, 60000);
    // TODO: Use websockets, this is dumb
    setInterval(() => {
      this.pollJobs();
    }, 1000);
  }

  querySession = async () => {
    const sessionWrapper = await SessionWrapper.lookupSession();
    this.setState({
      sessionWrapper: sessionWrapper,
    });
  };

  queryLanguage = async () => {
    let locale = await DetectLocale();
    if (DetectLocaleIsOk(locale)) {
      // TODO: Does not respect preference
      const hasSpanish = locale.language_codes.indexOf("es") > -1;
      const hasPortuguese = locale.language_codes.indexOf("pt") > -1;
      const hasTurkish = locale.language_codes.indexOf("tr") > -1;
      const hasIndonesian = locale.language_codes.indexOf("id") > -1;
      const hasGerman = locale.language_codes.indexOf("de") > -1;
      const hasJapanese = locale.language_codes.indexOf("ja") > -1;
      const hasFrench = locale.language_codes.indexOf("fr") > -1;
      const hasVietnamese = locale.language_codes.indexOf("vi") > -1;
      const hasHindi= locale.language_codes.indexOf("hi") > -1;
      const showNotice = hasSpanish || hasPortuguese || hasTurkish; //|| hasIndonesian || hasGerman || hasJapanese;

      let displayLanguage = Language.English;
      let languageCode = "en";

      let showPleaseFollowNotice = false;

      if (hasSpanish) {
        displayLanguage = Language.Spanish;
        languageCode = "es";
        showPleaseFollowNotice = true;
      } else if (hasPortuguese) {
        displayLanguage = Language.Portuguese;
        languageCode = "pt";
        showPleaseFollowNotice = true;
      } else if (hasTurkish) {
        displayLanguage = Language.Turkish;
        languageCode = "tr";
      } else if (hasIndonesian) {
        displayLanguage = Language.Indonesian;
        languageCode = "id";
      } else if (hasGerman) {
        displayLanguage = Language.German;
        languageCode = "de";
      } else if (hasJapanese) {
        displayLanguage = Language.Japanese;
        languageCode = "ja";
      } else if (hasFrench) {
        displayLanguage = Language.French;
        languageCode = "fr";
      } else if (hasVietnamese) {
        displayLanguage = Language.Vietnamese;
        languageCode = "vi";
      } else if (hasHindi) {
        displayLanguage = Language.Hindi;
        languageCode = "hi";
      }

      this.setState({
        isShowingLanguageNotice: showNotice,
        displayLanguage: displayLanguage,
        primaryLanguageCode: languageCode,
        isShowingPleaseFollowNotice: showPleaseFollowNotice,
      });

      i18n.changeLanguage(languageCode);
    }
  };

  logoutSession = () => {
    const api = new ApiConfig();
    const endpointUrl = api.logout();

    fetch(endpointUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((_raw_response) => {
        this.querySession();
      })
      .catch((e) => {
        /* Ignore. */
      });
  };

  clearVocodesNotice = () => {
    this.setState({ isShowingVocodesNotice: false });
  };

  clearLanguageNotice = () => {
    this.setState({ isShowingLanguageNotice: false });
  };

  clearTwitchTtsNotice = () => {
    this.setState({ isShowingTwitchTtsNotice: false });
  };

  clearPleaseFollowNotice = () => {
    this.setState({ isShowingPleaseFollowNotice: false });
  };

  enqueueTtsJob = (jobToken: string) => {
    const newJob = new TtsInferenceJob(jobToken);
    let inferenceJobs = this.state.ttsInferenceJobs.concat([newJob]);

    this.setState({
      ttsInferenceJobs: inferenceJobs,
    });
  };

  checkTtsJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getTtsInferenceJobState(jobToken);

    fetch(endpointUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        const jobResponse: TtsInferenceJobStateResponsePayload = response;

        if (jobResponse === undefined || jobResponse.state === undefined) {
          return;
        }

        let updatedJobs: Array<TtsInferenceJob> = [];

        this.state.ttsInferenceJobs.forEach((existingJob) => {
          if (
            existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)
          ) {
            updatedJobs.push(existingJob);
            return;
          }

          let updatedJob = TtsInferenceJob.fromResponse(jobResponse.state!);
          updatedJobs.push(updatedJob);
        });

        this.setState({
          ttsInferenceJobs: updatedJobs,
        });
      })
      .catch((e) => {
        /* Ignore. */
      });
  };

  enqueueTtsModelUploadJob = (jobToken: string) => {
    const newJob = new TtsModelUploadJob(jobToken);
    let modelUploadJobs = this.state.ttsModelUploadJobs.concat([newJob]);

    this.setState({
      ttsModelUploadJobs: modelUploadJobs,
    });
  };

  checkTtsModelUploadJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getTtsModelUploadJobState(jobToken);

    fetch(endpointUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        const jobResponse: TtsModelUploadJobStateResponsePayload = response;

        if (jobResponse === undefined || jobResponse.state === undefined) {
          return;
        }

        let updatedJobs: Array<TtsModelUploadJob> = [];
        this.state.ttsModelUploadJobs.forEach((existingJob) => {
          if (
            existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)
          ) {
            updatedJobs.push(existingJob);
            return;
          }

          let updatedJob = TtsModelUploadJob.fromResponse(jobResponse.state!);
          updatedJobs.push(updatedJob);
        });

        this.setState({
          ttsModelUploadJobs: updatedJobs,
        });
      })
      .catch((e) => {
        /* Ignore. */
      });
  };

  enqueueW2lJob = (jobToken: string) => {
    const newJob = new W2lInferenceJob(jobToken);
    let inferenceJobs = this.state.w2lInferenceJobs.concat([newJob]);

    this.setState({
      w2lInferenceJobs: inferenceJobs,
    });
  };

  checkW2lJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lInferenceJobState(jobToken);

    fetch(endpointUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        const jobResponse: W2lInferenceJobStateResponsePayload = response;

        if (jobResponse === undefined || jobResponse.state === undefined) {
          return;
        }

        let updatedJobs: Array<W2lInferenceJob> = [];
        this.state.w2lInferenceJobs.forEach((existingJob) => {
          if (
            existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)
          ) {
            updatedJobs.push(existingJob);
            return;
          }

          let updatedJob = W2lInferenceJob.fromResponse(jobResponse.state!);
          updatedJobs.push(updatedJob);
        });

        this.setState({
          w2lInferenceJobs: updatedJobs,
        });
      })
      .catch((e) => {
        /* Ignore. */
      });
  };

  enqueueW2lTemplateUploadJob = (jobToken: string) => {
    const newJob = new W2lTemplateUploadJob(jobToken);
    let inferenceJobs = this.state.w2lTemplateUploadJobs.concat([newJob]);

    this.setState({
      w2lTemplateUploadJobs: inferenceJobs,
    });
  };

  checkW2lTemplateUploadJob = (jobToken: string) => {
    const api = new ApiConfig();
    const endpointUrl = api.getW2lTemplateUploadJobState(jobToken);

    fetch(endpointUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((response) => {
        const jobResponse: W2lTemplateUploadJobStateResponsePayload = response;

        if (jobResponse === undefined || jobResponse.state === undefined) {
          return;
        }

        let updatedJobs: Array<W2lTemplateUploadJob> = [];

        this.state.w2lTemplateUploadJobs.forEach((existingJob) => {
          if (
            existingJob.jobToken !== jobResponse.state!.job_token ||
            !jobStateCanChange(existingJob.jobState)
          ) {
            updatedJobs.push(existingJob);
            return;
          }

          let updatedJob = W2lTemplateUploadJob.fromResponse(
            jobResponse.state!
          );
          updatedJobs.push(updatedJob);
        });

        this.setState({
          w2lTemplateUploadJobs: updatedJobs,
        });
      })
      .catch((e) => {
        /* Ignore. */
      });
  };

  pollJobs = () => {
    this.state.ttsInferenceJobs.forEach((job) => {
      if (jobStateCanChange(job.jobState)) {
        this.checkTtsJob(job.jobToken);
      }
    });
    this.state.w2lInferenceJobs.forEach((job) => {
      if (jobStateCanChange(job.jobState)) {
        this.checkW2lJob(job.jobToken);
      }
    });
    this.state.ttsModelUploadJobs.forEach((job) => {
      if (jobStateCanChange(job.jobState)) {
        this.checkTtsModelUploadJob(job.jobToken);
      }
    });
    this.state.w2lTemplateUploadJobs.forEach((job) => {
      if (jobStateCanChange(job.jobState)) {
        this.checkW2lTemplateUploadJob(job.jobToken);
      }
    });
  };

  setMigrationMode = (mode: MigrationMode) => {
    this.setState({ migrationMode: mode });
  };

  setTextBuffer = (textBuffer: string) => {
    this.setState({ textBuffer: textBuffer });
  };

  clearTextBuffer = () => {
    this.setState({ textBuffer: "" });
  };

  public render() {
    // Redesign features
    let mainClassNames = USE_REFRESH ? "bg-gradient" : "";
    let particlesBg = <></>;
    if (USE_REFRESH) {
      particlesBg = <><ParticlesBG></ParticlesBG></>
    }

    return (
      <BrowserRouter>
        <div id="main" className={mainClassNames}>
          {particlesBg}

          <div id="viewable">
            {/* This is the old vocodes1.0-compatible username and version switch
            <MigrationTopNav
              enableAlpha={this.state.enableAlpha}
              sessionWrapper={this.state.sessionWrapper}
              querySessionAction={this.querySession}
              />
            */}

            <div className="migrationComponentWrapper">
              <Switch>
                <Route path="/">
                  <NewVocodesContainer
                    sessionWrapper={this.state.sessionWrapper}
                    querySessionAction={this.querySession}
                    isShowingVocodesNotice={this.state.isShowingVocodesNotice}
                    clearVocodesNotice={this.clearVocodesNotice}
                    isShowingLangaugeNotice={this.state.isShowingLanguageNotice}
                    clearLanguageNotice={this.clearLanguageNotice}
                    displayLanguage={this.state.displayLanguage}
                    primaryLanguageCode={this.state.primaryLanguageCode}
                    isShowingTwitchTtsNotice={
                      this.state.isShowingTwitchTtsNotice
                    }
                    clearTwitchTtsNotice={this.clearTwitchTtsNotice}
                    isShowingPleaseFollowNotice={
                      this.state.isShowingPleaseFollowNotice
                    }
                    clearPleaseFollowNotice={this.clearPleaseFollowNotice}
                    enqueueTtsJob={this.enqueueTtsJob}
                    ttsInferenceJobs={this.state.ttsInferenceJobs}
                    enqueueW2lJob={this.enqueueW2lJob}
                    w2lInferenceJobs={this.state.w2lInferenceJobs}
                    enqueueTtsModelUploadJob={this.enqueueTtsModelUploadJob}
                    ttsModelUploadJobs={this.state.ttsModelUploadJobs}
                    enqueueW2lTemplateUploadJob={
                      this.enqueueW2lTemplateUploadJob
                    }
                    w2lTemplateUploadJobs={this.state.w2lTemplateUploadJobs}
                    textBuffer={this.state.textBuffer}
                    setTextBuffer={this.setTextBuffer}
                    clearTextBuffer={this.clearTextBuffer}
                    ttsModels={this.props.allTtsModels}
                    setTtsModels={this.props.setAllTtsModels}
                    allTtsCategories={this.props.allTtsCategories}
                    setAllTtsCategories={this.props.setAllTtsCategories}
                    allTtsCategoriesByTokenMap={
                      this.props.allTtsCategoriesByTokenMap
                    }
                    allTtsModelsByTokenMap={this.props.allTtsModelsByTokenMap}
                    ttsModelsByCategoryToken={
                      this.props.ttsModelsByCategoryToken
                    }
                    dropdownCategories={this.props.dropdownCategories}
                    setDropdownCategories={this.props.setDropdownCategories}
                    selectedCategories={this.props.selectedCategories}
                    setSelectedCategories={this.props.setSelectedCategories}
                    maybeSelectedTtsModel={this.props.maybeSelectedTtsModel}
                    setMaybeSelectedTtsModel={
                      this.props.setMaybeSelectedTtsModel
                    }
                  />
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export { App, MigrationMode, TtsInferenceJob, W2lInferenceJob };
