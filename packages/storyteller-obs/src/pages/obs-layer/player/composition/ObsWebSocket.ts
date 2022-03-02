import { ApiConfig } from "@storyteller/components";

class ObsWebSocket {

  private webSocket: WebSocket;

  private onErrorCallback?: (event: Event) => void;
  private onMessageCallback?: (event: MessageEvent) => void;

  constructor(
    twitchUsername: string, 
    onError?: (event: Event) => void,
    onMessage?: (event: MessageEvent) => void,
  ) {
    const url = new ApiConfig().obsEventsWebsocket(twitchUsername);
    const webSocket = new WebSocket(url);

    if (!!onError) {
      this.onErrorCallback = onError;
    }

    if (!!onMessage) {
      this.onMessageCallback = onMessage;
    }

    const that = this;

    webSocket.onopen = function (event: Event) { that.onOpen(event); };
    webSocket.onerror = function(event: Event) { that.onError(event); };
    webSocket.onmessage = function (event: MessageEvent) { that.onMessage(event); }

    this.webSocket = webSocket;
  }

  send(data: string) {
    this.webSocket.send(data);
  }

  close() {
    this.onErrorCallback = undefined;
    this.onMessageCallback = undefined;
    this.webSocket.close();
  }

  // ========== Handlers ==========

  private onOpen(event: Event) {
  }

  private onMessage(event: MessageEvent) {
    if (!!this.onMessageCallback) {
      this.onMessageCallback(event);
    }
  }

  private onError(event: Event) {
    if (!!this.onErrorCallback) {
      this.onErrorCallback(event);
    }
  }
}

export default ObsWebSocket;