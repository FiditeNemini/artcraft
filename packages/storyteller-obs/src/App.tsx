
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
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
