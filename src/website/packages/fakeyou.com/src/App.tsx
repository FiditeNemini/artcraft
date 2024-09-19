import "./AppNew.scss";
import "scss/custom-bootstrap.scss";

import React from "react";
import { ApiConfig } from "@storyteller/components";
import Cookies from "universal-cookie";
import {
  DetectLocale,
  DetectLocaleIsOk,
} from "@storyteller/components/src/api/locale/DetectLocale";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import PageContainer from "./v2/view/PageContainer";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { PosthogClient } from "@storyteller/components/src/analytics/PosthogClient";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { W2lInferenceJob } from "@storyteller/components/src/jobs/W2lInferenceJobs";
import { FAKEYOU_MERGED_TRANSLATIONS } from "./_i18n/FakeYouTranslations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import deepEqual from "deep-equal";
import {
  AvailableLanguageKey,
  AVAILABLE_LANGUAGE_MAP,
  ENGLISH_LANGUAGE,
} from "./_i18n/AvailableLanguageMap";
import { VoiceConversionModelListItem } from "@storyteller/components/src/api/voice_conversion/ListVoiceConversionModels";
import HttpBackend from "i18next-http-backend";

import { FooterNav } from "./v2/view/nav/FooterNav";

import { CoreServicesProvider } from "components/providers";

// NB: We're transitioning over to this instance of i18n-next that loads translations over HTTP from Json Files.
// The old i18n-next instance (see below) bakes in translations into the compiled javascript blob.
// This new instance uses the Locize paid service to manage translation strings on their website. It's automated,
// can easily sync to version control, and makes translation easy to maintain across a wide number of languages.
export const i18n2 = i18n.createInstance();
declare const window: Window & { dataLayer: Record<string, unknown>[] };

// OLD i18n-next instance
// This instance of i18n-next should not be used for new translations going forward.
// All of the translations behind this instance are backed into the javascript app at compile time and are manually
// curated and managed, which is a maintainability nightmare. In time, the above 'i18n2' instance will take over
// and we can remove this instance.
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: FAKEYOU_MERGED_TRANSLATIONS,
    fallbackLng: "en",

    // For finding 'Trans' component keys.
    debug: false,

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

i18n2.use(HttpBackend).init({
  fallbackLng: "en",
  debug: false,
  backend: {
    // This is the path localizations are loaded from.
    loadPath: "/locales/{{lng}}/{{ns}}.json",
  },
});

enum MigrationMode {
  NEW_VOCODES,
  OLD_VOCODES,
}

interface Props {}

interface State {
  // Migration Mode
  // migrationMode: MigrationMode;

  // Rollout of vocodes 2.0
  // enableAlpha: boolean;

  sessionFetched: boolean;
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;

  // Locale + show flash notice to Spanish speakers
  //localeLanguageCodes: string[],
  //localeFullLanguageTags: string[],
  // isShowingLanguageNotice: boolean;
  // displayLanguage: Language;
  // primaryLanguageCode: string;

  // isShowingTwitchTtsNotice: boolean;
  // isShowingPleaseFollowNotice: boolean;

  // An improved notice for "new" languages asking users to help.
  // isShowingBootstrapLanguageNotice: boolean;

  // Current text entered
  textBuffer: string;

  // voiceConversionModels: VoiceConversionModelListItem[];
  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
}

// TODO: Port to functional component
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      sessionFetched: false,
      sessionWrapper: SessionWrapper.emptySession(),
      sessionSubscriptionsWrapper:
        SessionSubscriptionsWrapper.emptySubscriptions(),

      textBuffer: "",

      maybeSelectedVoiceConversionModel: undefined,
    };
  }

  componentWillMount() {
    // Check to see if there is a cookie for darkMode;
    if (!window.localStorage.getItem("darkMode")) {
      // if not, set one to false to ensure we are defualting to dark mode.
      window.localStorage.setItem("darkMode", "false");
    }

    // Check to see if there is a cookie for lowSpec;
    if (!window.localStorage.getItem("lowSpec")) {
      // if not, set one to true to ensure we are defualting to low spec mode.
      window.localStorage.setItem("lowSpec", "true");
    }

    require("./AppOld.scss");
    require("./v2/view/_css/footer.scss");
  }

  async componentDidMount() {
    await this.queryLanguage();
    await this.querySession();
    await this.querySessionSubscriptions();

    setInterval(async () => {
      // See warnings in the following methods when adding new methods
      // that affect global "state"
      await this.querySession();
      await this.querySessionSubscriptions();
    }, 60000);
    // TODO: Use websockets, this is dumb
  }

  querySession = async () => {
    // WARNING: Making setState calls in this scope without checking existing
    // state can cause the whole site to refresh/worsen UX. Double check if
    // state needs to be set here, or if instead can be refreshed locally on
    // the page where the new "state" needed
    const sessionWrapper = await SessionWrapper.lookupSession();
    const username = sessionWrapper.getDisplayName();
    const cookies = new Cookies();

    if (username !== undefined) {
      // Track only logged-in users (for now)
      PosthogClient.enablePosthog();
      PosthogClient.setUsername(username);
      cookies.set("logged_in_username", username, {
        path: "/",
        expires: new Date(Date.now() + 3 * 86400000),
      });
      window.dataLayer.push({
        user_id: username,
      });
    } else {
      cookies.remove("logged_in_username", { path: "/" });
    }

    if (!deepEqual(sessionWrapper, this.state.sessionWrapper)) {
      this.setState({
        sessionWrapper: sessionWrapper,
      });
    }
  };

  querySessionSubscriptions = async () => {
    // WARNING: Making setState calls in this scope without checking existing
    // state can cause the whole site to refresh/worsen UX. Double check if
    // state needs to be set here, or if instead can be refreshed locally on
    // the page where the new "state" needed

    if (this.state.sessionFetched === false) {
      this.setState({ sessionFetched: true });
    }

    const cookies = new Cookies();

    const sessionSubscriptionsWrapper =
      await SessionSubscriptionsWrapper.lookupActiveSubscriptions();

    const plan = sessionSubscriptionsWrapper.getActiveProductSlug();
    if (plan !== undefined) {
      cookies.set("logged_in_user_plan", plan, {
        path: "/",
        expires: new Date(Date.now() + 3 * 86400000),
      });
    } else {
      cookies.remove("logged_in_user_plan", { path: "/" });
    }

    if (
      !deepEqual(
        sessionSubscriptionsWrapper,
        this.state.sessionSubscriptionsWrapper
      )
    ) {
      this.setState({
        sessionSubscriptionsWrapper: sessionSubscriptionsWrapper,
      });
    }
  };

  queryLanguage = async () => {
    let locale = await DetectLocale();
    if (DetectLocaleIsOk(locale)) {
      // NB: We treat the language preference as being the order in the array.
      //  As of 2023-01-14, the backend does not handle quality values / q-weights,
      //  so these may be slightly wrong. An adjustment to the server will fix this.

      let preferredLanguage = ENGLISH_LANGUAGE;

      for (let languageCode of locale.language_codes) {
        let maybeLanguage =
          AVAILABLE_LANGUAGE_MAP[languageCode as AvailableLanguageKey];

        if (maybeLanguage !== undefined) {
          preferredLanguage = maybeLanguage;
          break;
        }
      }

      i18n.changeLanguage(preferredLanguage.languageCode);
      i18n2.changeLanguage(preferredLanguage.languageCode);
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
      .then(_raw_response => {
        this.querySession();
        this.querySessionSubscriptions();
      })
      .catch(e => {
        /* Ignore. */
      });
  };

  setTextBuffer = (textBuffer: string) => {
    this.setState({ textBuffer: textBuffer });
  };

  clearTextBuffer = () => {
    this.setState({ textBuffer: "" });
  };

  public render() {
    return (
      <BrowserRouter>
        <div id="main" className="bg-gradient">
          <div id="viewable">
            {/* This is the old vocodes1.0-compatible username and version switch
            <MigrationTopNav
              enableAlpha={this.state.enableAlpha}
              sessionWrapper={this.state.sessionWrapper}
              querySessionAction={this.querySession}
              />
            */}

            <div className="migrationComponentWrapper">
              <CoreServicesProvider
                {...{
                  querySession: this.querySession,
                  querySubscriptions: this.querySessionSubscriptions,
                  state: this.state,
                }}
              >
                <Switch>
                  <Route path="/">
                    <PageContainer
                      textBuffer={this.state.textBuffer}
                      setTextBuffer={this.setTextBuffer}
                      clearTextBuffer={this.clearTextBuffer}
                      maybeSelectedVoiceConversionModel={
                        this.state.maybeSelectedVoiceConversionModel
                      }
                    />
                  </Route>
                </Switch>

                <FooterNav sessionWrapper={this.state.sessionWrapper} />
              </CoreServicesProvider>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export { App, MigrationMode, TtsInferenceJob, W2lInferenceJob };
