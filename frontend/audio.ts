// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

declare var buzz: any; // TODO: static types.

export default class Audio {
  sound: any;

  constructor() {
    this.sound = null;
  }

  playUrl(url: string) {
    this.stop();
    this.sound = new buzz.sound(url);
    this.sound.play();
  }

  stop() {
    if (this.sound != null) {
      this.sound.stop();
    }
  }
}

