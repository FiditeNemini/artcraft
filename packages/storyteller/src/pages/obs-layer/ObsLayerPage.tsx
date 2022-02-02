import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  const url = `ws://localhost:54321/obs/${twitchUsername}`;
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

  //setInterval(() => {
  //  console.log('sending browser message to server on interval');
  //  sock.send('interval trigger from browser');
  //}, 2000);
}

export { ObsLayerPage }