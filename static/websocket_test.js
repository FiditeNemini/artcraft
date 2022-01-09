
(function() {
    console.log('installing script');

    const WS_URL = 'ws://localhost:54321/obs';

    let sock = new WebSocket(WS_URL);

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
        sock.send('interval trigger');
    }, 2000);

    //setTimeout(() => {
    //    console.log('disconnect')
    //    const normal_close = 1000;
    //    sock.close(normal_close, 'close');
    //
    //}, 10000)

})();