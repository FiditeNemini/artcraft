import "./AppNew.scss";
import "scss/custom-bootstrap.scss";

import React from "react";
import { BrowserRouter } from "react-router-dom";
import PageContainer from "./v2/view/PageContainer";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import { W2lInferenceJob } from "@storyteller/components/src/jobs/W2lInferenceJobs";
import { FAKEYOU_MERGED_TRANSLATIONS } from "./_i18n/FakeYouTranslations";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
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
  textBuffer: string;
  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
}

// TODO: Port to functional component
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
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
            <div className="migrationComponentWrapper">
              <CoreServicesProvider>
                <PageContainer
                  textBuffer={this.state.textBuffer}
                  setTextBuffer={this.setTextBuffer}
                  clearTextBuffer={this.clearTextBuffer}
                  maybeSelectedVoiceConversionModel={
                    this.state.maybeSelectedVoiceConversionModel
                  }
                />
                <FooterNav />
              </CoreServicesProvider>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export { App, MigrationMode, TtsInferenceJob, W2lInferenceJob };
