import React from 'react';
import { withTranslation } from 'react-i18next';
import { AppWrapper } from './AppWrapper';

interface Props {
  // Certan browsers (iPhone) have pitiful support for drawing APIs. Worse yet,
  // they seem to lose the "touch event sandboxing" that allows for audio to be 
  // played after user interaction if the XHRs delivering the audio don't do so
  // as actual audio mimetypes. (Decoding from base64 and trying to play fails.)
  enableSpectrograms: boolean,

  // Whether or not to inform users that the name of the website has changed.
  flashVocodesNotice: boolean,
}

function AppTranslated(props: Props) {
  return (
    <AppWrapper 
        enableSpectrograms={props.enableSpectrograms} 
        flashVocodesNotice={props.flashVocodesNotice}
      />
  )
}

// NB: This is a Higher Order Component (HOC) that will pass `t` and `i18n`
// so that we can change the language statefully at runtime. If we don't do
// this, some pages won't respond to translation.
export default withTranslation()(AppTranslated);
