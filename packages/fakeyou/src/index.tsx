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

// We can't include Bootstrap CSS along with Bulma since some of the class names conflict.
// TODO(echelon): Once ported, statically move CSS to "index.html".
if (USE_REFRESH) {
  const bootstrapCss = document.createElement("link");
  bootstrapCss.setAttribute("rel", "stylesheet");
  bootstrapCss.setAttribute("crossorigin", "anonymous");
  bootstrapCss.setAttribute("integrity", "sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3");
  bootstrapCss.setAttribute("href", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css");
  document.getElementsByTagName("head")[0].appendChild(bootstrapCss);

  const bootstrapJs = document.createElement("script");
  bootstrapJs.setAttribute("rel", "stylesheet");
  bootstrapJs.setAttribute("crossorigin", "anonymous");
  bootstrapJs.setAttribute("integrity", "sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p");
  bootstrapJs.setAttribute("src", "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js");
  document.getElementsByTagName("body")[0].appendChild(bootstrapJs);
} else {
  const bulmaCss = document.createElement("link");
  bulmaCss.setAttribute("rel", "stylesheet");
  bulmaCss.setAttribute("crossorigin", "anonymous");
  bulmaCss.setAttribute("href", "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css");
  document.getElementsByTagName("head")[0].appendChild(bulmaCss);
}

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
