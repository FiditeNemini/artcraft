import 'bulma/css/bulma.css'

import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import IndexPage from './pages/index/IndexPage';
import VoxelCamPage from './pages/voxelcam/IndexPage';

function App () {
  return (
    <div id="main" className="mainwrap">
      <div id="viewable">
        <BrowserRouter>
          <Route path="/voxelcam">
            <VoxelCamPage />
          </Route>
          <Route exact={true} path="/">
            <IndexPage />
          </Route>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
