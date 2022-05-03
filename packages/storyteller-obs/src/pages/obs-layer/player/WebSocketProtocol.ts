// This class encodes our websocket protocol and sequences playing of clips.

import { Howl } from 'howler';
import MediaQueue from "./composition/MediaQueue";
import ObsWebSocket from "./composition/ObsWebSocket";

// If a new socket is unhealthy after this many seconds, refresh the page.
const NEW_SOCKET_TTL_MILLIS = 30_000;

// If a previously working socket is unhealthy after this many seconds, refresh the page.
const WORKING_SOCKET_TTL_MILLIS = 60_000;

class WebSocketProtocol {
  twitchUsername: string;

  mediaQueue: MediaQueue;

  webSocket?: ObsWebSocket;

  currentSound?: Howl;

  // Keep track of last successful ping delta to force page refreshes.
  createdTime: Date;
  lastSuccessfulPingTime?: Date;

  constructor(twitchUsername: string) {
    this.twitchUsername = twitchUsername;
    this.mediaQueue = new MediaQueue();
    this.createdTime = new Date();
  }

  start() {
    this.newWebsocket();
    this.beginPollingMediaQueue();
    this.beginPollingAvailableAudioToPlay();
    this.beginPollingWebsocket();
    this.beginHealthCheckingPage();
  }

  private newWebsocket() {
    console.warn('creating new websocket');
    if (this.webSocket) {
      this.webSocket.close();
    }
    const that = this;
    this.webSocket = new ObsWebSocket(
      this.twitchUsername,
      (ev: Event) => that.onWebsocketError(ev),
      (ev: MessageEvent) => that.onWebsocketMessage(ev),
    );
  }

  private beginPollingMediaQueue() {
    const that = this;
    setInterval(async () => {
      await that.mediaQueue.queryAllPendingJobs();
    }, 1000);
  }

  private beginPollingAvailableAudioToPlay() {
    const that = this;
    setInterval(() => {
      that.playNextAvailableAudio();
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

  private beginHealthCheckingPage() {
    // HACK: We're getting a lot of reports that OBS will stop playing audio
    // after 10-30 minutes. We'll force a page reload if the socket hasn't
    // reported any data to us. Not sure if this is a proper fix yet.
    const that = this;
    setInterval(() => {
      const now = new Date();
      let delta = -1;
      let ttl = 0;

      if (that.lastSuccessfulPingTime !== undefined) {
        delta = now.getTime() - that.lastSuccessfulPingTime.getTime();
        ttl = WORKING_SOCKET_TTL_MILLIS;
      } else {
        delta = now.getTime() - that.createdTime.getTime();
        ttl = NEW_SOCKET_TTL_MILLIS;
      }

      if (delta > ttl) {
        console.error('Socket appears unhealthy! TTL elapsed. Reloading page.');
        window.location.reload();
      }
    }, 5000);
  }

  private onWebsocketError(event: Event) {
    const that = this;
    setTimeout(() => that.newWebsocket(), 1000);
  }

  private onWebsocketMessage(event: MessageEvent) {
    const result = JSON.parse(event.data);

    console.log('message', result);

    this.lastSuccessfulPingTime = new Date();

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
      autoplay: false,
      loop: false,
      onend: function(soundId: number) {
        that.currentSound = undefined;
        that.playNextAvailableAudio(); // eagerly play the next one.
      },
    });

    this.currentSound = sound;

    sound.once('load', function() {
      sound.play();
    });
  }
}

export default WebSocketProtocol;
