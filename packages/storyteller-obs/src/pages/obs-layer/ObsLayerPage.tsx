import React, { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import WebSocketProtocol from './player/WebSocketProtocol';

/*
NB: Debugging with CORS and self signed certs in local dev is a nightmare. Use this (Linux):

    chromium-browser --disable-web-security --user-data-dir="~/chrome"

*/

function ObsLayerPage() {
  const { username } : { username : string } = useParams();

  // FIXME: We're going to remove the "click to activate" button by switching this to true
  // Ultimately all of this UI should be pulled out, because very few people are using this
  // through their browsers.
  const [interfaceHidden, setInterfaceHidden]= useState(true);

  const webSocketProtocolRef = useRef<WebSocketProtocol>(new WebSocketProtocol(username));

  useEffect(() => {
    webSocketProtocolRef.current.start();

    // Click anywhere on the page to activate sounds.
    document.documentElement.addEventListener("mousedown", () => {
      console.log('play dummy sound');
      let sound = new Howl({
        src: ['foo']
      });
      sound.play();
    })

  }, [username]);

  if (interfaceHidden) {
    return <></>;
  }

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Paste this page's URL into OBS
          </h1>
          <h1 className="subtitle is-5">Twitch Username : {username}</h1>
          <br />
          <button
            className="button is-info is-large is-fullwidth"
            onClick={() => setInterfaceHidden(true)}
            >
            <FontAwesomeIcon icon={faVolumeUp} />&nbsp;&nbsp;Click this to activate audio and hide UI 
          </button>
        </div>
      </section>
    </div>
  )
}

export { ObsLayerPage }