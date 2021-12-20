
(function() {
    console.log('installing script');

    const WS_URL = 'ws://localhost:54321/obs';

    let sock = new WebSocket(WS_URL);

    sock.onopen = function (event) {
        console.log('on open event', event);
        sock.send('on open message from client');
    };

    sock.onmessage = function (event) {
        console.log('on message event', event.data);
    }

    setInterval(() => {
        console.log('sending message to server on interval');
        sock.send('interval trigger');
    }, 2000);

})();