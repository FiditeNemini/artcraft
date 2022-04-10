import 'bulma/css/bulma.css'

import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { ObsLayerPage } from './pages/obs-layer/ObsLayerPage';


function App () {
  return (
    <div id="main" className="mainwrap">
      <div id="viewable">
        <BrowserRouter>
          <Route path="/twitch/:username">
            <ObsLayerPage />
          </Route>
          <Route exact={true} path="/">
            <div style={{ width: "500px", margin: "auto", textAlign: "center" }}>
            <h1>Invalid Page for OBS</h1>
            <h3><a href="https://create.storyteller.io">Go Back</a></h3>
            </div>
          </Route>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
