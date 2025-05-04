import {Howl} from 'howler';

export class SoundEffect {

  readonly soundUrl: string;
  readonly howlerSound: Howl;
  readonly defaultVolume: number;

  constructor(soundUrl: string, defaultVolume?: number) {
    this.soundUrl = soundUrl;
    this.defaultVolume = defaultVolume || 1.0;
    this.howlerSound = new Howl({
      src: [soundUrl],
      autoplay: false,
      loop: false,
      volume: defaultVolume,
    });
  }

  public play() {
    this.howlerSound.play();
  }
}
