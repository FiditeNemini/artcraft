import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ApiConfig } from '@storyteller/components';

function ObsLayerPage() {
  const { username } : { username : string } = useParams();

  useEffect(() => {
    openWebsocket(username);
  }, [username]);

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Paste this page's URL into OBS
          </h1>
        </div>
      </section>
    </div>
  )
}

function openWebsocket(twitchUsername: string) {
  const url = new ApiConfig().obsEventsWebsocket(twitchUsername);
  const sock = new WebSocket(url);

  sock.onopen = function (event: Event) {
    console.log('on open event', event);
    sock.send('on open message from browser');
  };

  sock.onmessage = function (event: MessageEvent) {
    console.log('on message event', event.data);
  }

  sock.onerror = function(event: Event) {
    console.log('on error event', event);
  }

  // NB: This has a direct bearing on how fast the backend responds.
  // Increasing the delay will slow down the flow of events.
  setInterval(() => {
    sock.send('ping');
  }, 1000);
}

export { ObsLayerPage }