// FIXME: no type declarations exist.
declare var $: any;
declare var WaveSurfer: any;

type WaveSurfer = any;

export default class WaveformPlayer {
  wavesurfer: WaveSurfer;

  constructor(css_selector: string, waveColor?: string,
              progressColor?: string) {
    waveColor = waveColor
        || $('meta[name=wave_color]').attr('content')
        || 'teal';

    progressColor = progressColor
        || $('meta[name=progress_color]').attr('content')
        || 'purple';

    this.wavesurfer = WaveSurfer.create({
        container: css_selector,
        waveColor: waveColor,
        progressColor: progressColor,
    });
  }

  /** Load the wav url. */
  load(wav_url: string) {
    this.wavesurfer.load(wav_url);
  }

  /** Load the wav url and immediately play it. */
  loadAndPlay(wav_url: string) {
    let that = this;
    this.load(wav_url);
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
  }
}

window['waveform_player'] = new WaveformPlayer('#waveform');

