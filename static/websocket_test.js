
const WS_URL = 'ws://localhost:54321/obs';

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