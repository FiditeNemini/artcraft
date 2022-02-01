import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
//import { Common } from "@storyteller/components";
import { IndexPage } from './pages/index/IndexPage';
import { TopNav } from './layout/TopNav';
import { StreamPage } from './pages/stream/StreamPage';
import { ComingSoonPage } from './pages/coming-soon/ComingSoonPage';
import { ObsLayerPage } from './pages/obs-layer/ObsLayerPage';

function App() {
  return (
    <BrowserRouter>
      <div id="main" className="mainwrap">
        <div id="viewable">
          <TopNav />

          <Switch>
            <Route path="/stream">
              <StreamPage />
            </Route>
            <Route path="/coming-soon">
              <ComingSoonPage />
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

export default App;
