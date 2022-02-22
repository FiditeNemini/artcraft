import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import StreamPage from './pages/stream/StreamPage';
import i18n from 'i18next';
import { ComingSoonPage } from './pages/coming-soon/ComingSoonPage';
import { LoginPage } from './pages/login/LoginPage';
import { SignupPage } from './pages/signup/SignupPage';
import { TtsConfigsIndexPage } from './pages/tts_configs/TtsConfigsIndexPage';
import { DetectLocale, DetectLocaleIsOk } from '@storyteller/components/src/api/locale/DetectLocale';
import { IndexPage } from './pages/index/IndexPage';
import { ObsLayerPage } from './pages/obs-layer/ObsLayerPage';
import { STORYTELLER_MERGED_TRANSLATIONS } from './_i18n/StorytellerTranslations'
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { TopNav } from './layout/TopNav';
import { initReactI18next } from 'react-i18next';
import { TtsConfigsCreateRulePage } from './pages/tts_configs/TtsConfigsCreateRulePage';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: STORYTELLER_MERGED_TRANSLATIONS,
    //lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

interface Props {
}

interface State {
  sessionWrapper: SessionWrapper,
}

// Root element is a non-functional component for easier global lifecycle management
class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      sessionWrapper: SessionWrapper.emptySession(),
    };
  }

  async componentDidMount() {
    await this.querySession();
    await this.queryLanguage();
    setInterval(async () => { await this.querySession() }, 60000);
  }

  querySession = async () => {
    const sessionWrapper = await SessionWrapper.lookupSession();
    this.setState({ 
      sessionWrapper: sessionWrapper,
    });
  }

  queryLanguage = async () => {
    let locale = await DetectLocale();
    if (DetectLocaleIsOk(locale)) {
      // TODO
    }
  }

  public render() {
    return (
      <BrowserRouter>
        <div id="main" className="mainwrap">
          <div id="viewable">
            <TopNav 
              sessionWrapper={this.state.sessionWrapper}
              querySessionCallback={this.querySession}
              />

            <Switch>
              <Route path="/stream">
                <StreamPage />
              </Route>
              <Route path="/coming-soon">
                <ComingSoonPage />
              </Route>
              <Route path="/signup">
                <SignupPage
                  sessionWrapper={this.state.sessionWrapper}
                  querySessionCallback={this.querySession}
                  />
              </Route>
              <Route path="/login">
                <LoginPage 
                  sessionWrapper={this.state.sessionWrapper}
                  querySessionAction={this.querySession}
                  />
              </Route>
              <Route exact={true} path="/tts_configs/create">
                <TtsConfigsCreateRulePage
                  sessionWrapper={this.state.sessionWrapper}
                />
              </Route>
              <Route exact={true} path="/tts_configs">
                <TtsConfigsIndexPage
                  sessionWrapper={this.state.sessionWrapper}
                />
              </Route>
              <Route path="/obs/:username">
                <ObsLayerPage />
              </Route>
              <Route exact={true} path="/">
                <IndexPage />
              </Route>
            </Switch>

          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
