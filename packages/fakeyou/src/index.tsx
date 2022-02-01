import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { AppWrapper } from './AppWrapper';

const IS_IOS : boolean = /iPad|iPhone|iPod/.test(navigator.platform || "");

const enableSpectrograms = !IS_IOS;

const flashVocodesNotice = new URLSearchParams(window.location.search).has('vocodes');

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper 
        enableSpectrograms={enableSpectrograms} 
        flashVocodesNotice={flashVocodesNotice}
      />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
