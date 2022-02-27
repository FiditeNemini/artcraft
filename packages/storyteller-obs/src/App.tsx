
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ObsLayerPage } from './pages/obs-layer/ObsLayerPage';


interface Props {
}

function App (props: Props) {
  return (
    <div id="main" className="mainwrap">
      <div id="viewable">
        <BrowserRouter>
          <ObsLayerPage />
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
