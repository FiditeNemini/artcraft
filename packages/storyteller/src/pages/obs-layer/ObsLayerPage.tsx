import React from 'react';

function ObsLayerPage() {
  const WS_URL = 'ws://localhost:54321/obs';

  //const url = `${WS_URL}/${props.twitchUsername}`;

  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Stream TTS
          </h1>
          <p className="subtitle">
            Early Alpha Preview
          </p>
          <div className="content">
            <p>This is an early demo of our Stream TTS, powered by FakeYou. 
              It does not currently offer customization, though our plans are to 
              allow for a high degree of configurability: set your own voices, rewards, etc.</p>
              
            <p>You don't need to set up any software on your end. Simply point OBS or your 
              broadcast software the URL below:</p>
          </div>
        </div>
      </section>
    </div>
  )
}

/*

const DEFAULT_USERNAME = 'testytest512';

(function() {
    console.log('installing script');

    const maybeUsername = window.location.hash.replace('#', '').trim();

    const username = (!!maybeUsername) ? maybeUsername : DEFAULT_USERNAME;

    console.log('username', username);
    document.getElementById('username').innerHTML = username;

    const url = `${WS_URL}/${username}`;

    let sock = new WebSocket(url);

    sock.onopen = function (event) {
        console.log('on open event', event);
        sock.send('on open message from browser');
    };

    sock.onmessage = function (event) {
        console.log('on message event', event.data);
    }

    sock.onerror = function(event) {
        console.log('on error event', event.data);
    }

    setInterval(() => {
        console.log('sending browser message to server on interval');
        sock.send('interval trigger from browser');
    }, 2000);

    //setTimeout(() => {
    //    console.log('disconnect')
    //    const normal_close = 1000;
    //    sock.close(normal_close, 'close');
    //
    //}, 10000)

})();
*/



export { ObsLayerPage }