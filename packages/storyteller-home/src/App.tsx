import 'bulma/css/bulma.css'

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { TopNav } from './common/TopNav';
import IndexPage from './pages/index/IndexPage';
import VoxelCamPage from './pages/voxelcam/VoxelCamPage';

function App () {
  return (
    <BrowserRouter>
      <div id="main" className="mainwrap">
        <div id="viewable">
          <TopNav />

          <Switch>
            <Route path="/voxelcam">
              <VoxelCamPage />
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
