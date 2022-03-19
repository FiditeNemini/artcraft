import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { TopNav } from './common/TopNav';
import IndexPage from './pages/index/IndexPage';
import VoxelCamPage from './pages/voxelcam/VoxelCamPage';
import { Footer } from './common/Footer';

function App () {
  return (
    <>
      <BrowserRouter>
        <div id="main" className="mainwrap">
          <div id="viewable">
            {/*<TopNav /> */}

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
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
