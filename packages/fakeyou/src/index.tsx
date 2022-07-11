import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import AppTranslated from './AppTranslated';
import { USE_REFRESH } from './Refresh';

const IS_IOS : boolean = /iPad|iPhone|iPod/.test(navigator.platform || "");

const enableSpectrograms = !IS_IOS;

const flashVocodesNotice = new URLSearchParams(window.location.search).has('vocodes');

const designSystemClass = USE_REFRESH ? 'fakeyou-refresh' : 'fakeyou-old';

document.getElementsByTagName('html')[0].classList.add(designSystemClass);

ReactDOM.render(
  <React.StrictMode>
    <AppTranslated
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
