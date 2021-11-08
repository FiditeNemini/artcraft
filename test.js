//var sock = new WebSocket("ws://api.jungle.horse:80/twitch");
var sock = new WebSocket("ws://localhost:12345/twitch");

sock.onopen = function (event) {
    console.log('on open event', event);
    sock.send('on open message from client');
};

sock.onmessage = function (event) {
    console.log('on message event', event.data);
}

sock.send('this is a message from the client');
