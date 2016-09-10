// FIXME: no type declarations exist.
declare var $: any;
declare var WaveSurfer: any;

type WaveSurfer = any;

export default class WaveformPlayer {
  /** Sound and Vizualization API. */
  wavesurfer: WaveSurfer;

  /**
   * Whether the player is "cleared" of an audio file.
   * Necessary to maintain our own state since the library will happily
   * resume playing if told, even after it is "cleared".
   */
  isCleared: boolean;

  constructor(cssSelector: string, waveColor?: string,
              progressColor?: string) {
    waveColor = waveColor
        || $('meta[name=wave_color]').attr('content')
        || 'teal';

    progressColor = progressColor
        || $('meta[name=progress_color]').attr('content')
        || 'purple';

    this.wavesurfer = WaveSurfer.create({
        container: cssSelector,
        waveColor: waveColor,
        progressColor: progressColor,
    });

    this.isCleared = true;
  }

  /** Load the wav url. */
  load(wavUrl: string) {
    this.wavesurfer.load(wavUrl);
    this.isCleared = false;
  }

  /** Load the wav url and immediately play it. */
  loadAndPlay(wavUrl: string) {
    let that = this;
    this.load(wavUrl);
    this.isCleared = false;
    this.wavesurfer.on('ready', function () {
        that.wavesurfer.play();
    });
  }

  /** In place pause. */
  pause() {
    this.wavesurfer.pause();
  }

  /** Resume playing at current position. */
  play() {
    if (this.isCleared) {
      return; // Nothing to play.
    }
    this.wavesurfer.play();
  }

  /** Toggle play/pause states. */
  toggle() {
    if (this.wavesurfer.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /** Stop and return to the beginning. */
  stop() {
    this.wavesurfer.stop();
  }

  /** Stop and clear the waveform data. */
  clear() {
    this.wavesurfer.empty();
    this.isCleared = true;
  }
}

window['waveform_player'] = new WaveformPlayer('#waveform');

