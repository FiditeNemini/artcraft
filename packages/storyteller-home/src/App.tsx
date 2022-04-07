import 'bulma/css/bulma.css'
import './App.scss';

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import IndexPage from './pages/index/IndexPage';
import VoxelCamPage from './pages/voxelcam/VoxelCamPage';
import { Footer } from './common/Footer';
import JobsPage from './pages/jobs/JobsPage';
import ScrollToTop from '@storyteller/components/src/elements/ScrollToTop';

function App () {
  return (
    <>
      <BrowserRouter>
        <div id="main" className="mainwrap">
          <div id="viewable">
            {/*<TopNav /> */}
            <ScrollToTop />
            <Switch>
              <Route path="/voxelcam">
                <VoxelCamPage />
              </Route>
              <Route path="/jobs">
                <JobsPage />
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
