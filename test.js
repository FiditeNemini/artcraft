//var sock = new WebSocket("ws://api.jungle.horse:80/twitch");
var sock = new WebSocket("ws://localhost:12345/twitch");

sock.onopen = function (event) {
    //sock.send("Here's some text that the server is urgently awaiting!");
};

sock.onmessage = function (event) {
    console.log('got a message', event.data);
}