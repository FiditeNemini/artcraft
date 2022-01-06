import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { AppWrapper } from './AppWrapper';

const IS_IOS : boolean = /iPad|iPhone|iPod/.test(navigator.platform || "");

let enableSpectrograms = !IS_IOS;

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper enableSpectrograms={enableSpectrograms} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
