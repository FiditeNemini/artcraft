// This class encodes our websocket protocol and sequences playing of clips.

import { Howl } from 'howler';
import MediaQueue from "./composition/MediaQueue";
import ObsWebSocket from "./composition/ObsWebSocket";

class WebSocketProtocol {
  twitchUsername: string;

  mediaQueue: MediaQueue;

  webSocket?: ObsWebSocket;

  currentSound?: Howl;

  constructor(twitchUsername: string) {
    this.twitchUsername = twitchUsername;
    this.mediaQueue = new MediaQueue();
  }

  start() {
    this.newWebsocket();
    this.beginPollingMediaQueue();
    this.beginPollingAvailableAudioToPlay();
    this.beginPollingWebsocket();
  }

  private newWebsocket() {
    console.warn('creating new websocket');
    if (this.webSocket) {
      this.webSocket.close();
    }
    const that = this;
    this.webSocket = new ObsWebSocket(
      this.twitchUsername,
      (ev: any) => that.onWebsocketError(ev),
      (ev: any) => that.onWebsocketMessage(ev),
    );
  }

  private beginPollingMediaQueue() {
    setInterval(async () => {
      await this.mediaQueue.queryAllPendingJobs();
    }, 1000);
  }

  private beginPollingAvailableAudioToPlay() {
    const that = this;
    setInterval(() => {
      this.playNextAvailableAudio();
    }, 1000);
  }

  private beginPollingWebsocket() {
    // NB: This has a direct bearing on how fast the backend responds.
    // Increasing the delay will slow down the flow of events.
    const that = this;
    setInterval(async () => {
      if (!!that.webSocket) {
        that.webSocket.send('ping');
      }
    }, 1000);
  }


  private onWebsocketError(event: Event) {
    console.log('wsError', event);
    const that = this;
    setTimeout(() => that.newWebsocket(), 1000);
  }

  private onWebsocketMessage(event: MessageEvent) {
    const result = JSON.parse(event.data);

    console.log('message', result);

    if (result['response_type'] === 'TtsEvent') {
      this.handleTtsWebsocketMessage(result);
    }
  }

  private handleTtsWebsocketMessage(result: any) {
    if ('tts_job_tokens' in result) {
      result['tts_job_tokens'].forEach((jobToken : string) => {
        this.mediaQueue.addNewTtsJobToken(jobToken);
      });
    }
  }

  private isCurrentlyPlayingAudio() {
    return this.currentSound !== undefined && this.currentSound.playing();
  }

  private playNextAvailableAudio() {
    if (this.isCurrentlyPlayingAudio()) {
      return; // Not ready.
    }

    const maybePlayableAudio = this.mediaQueue.getNextAvailable();
    if (!maybePlayableAudio) {
      return; // No audio available.
    }

    const that = this;

    const sound = new Howl({
      src: [maybePlayableAudio.getUrl()],
      onend: function(soundId: number) {
        that.playNextAvailableAudio(); // eagerly play the next one.
      }
    });

    sound.play();
  }
}

export default WebSocketProtocol;
