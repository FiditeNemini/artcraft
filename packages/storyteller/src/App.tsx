import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
//import { Common } from "@storyteller/components";
import { IndexPage } from './pages/index/IndexPage';
import { TopNav } from './layout/TopNav';
import StreamPage from './pages/stream/StreamPage';
import { ComingSoonPage } from './pages/coming-soon/ComingSoonPage';
import { ObsLayerPage } from './pages/obs-layer/ObsLayerPage';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { DetectLocale, DetectLocaleIsOk } from '@storyteller/components/src/api/locale/DetectLocale';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS } from './_i18n/Translations'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: TRANSLATIONS,
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
