// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

/// <reference path='buzz.d.ts' />
import buzz = require('buzz');

import { trumpAnimation } from './trump_animation';

export default class Audio {
  sound: buzz.Sound;

  constructor() {
    this.sound = null;
  }

  playUrl(url: string) {
    this.stop();
    this.sound = new buzz.sound(url);
    this.sound.play();

    // Possible events: 'play', 'playing'
    this.sound.bind('playing', function() {
      trumpAnimation.talkRandom();
    });

    // Possible events: 'error', 'ended', 'pause'
    this.sound.bind('pause', function() {
      trumpAnimation.stopTalking();
    });
  }

  stop() {
    if (this.sound != null) {
      this.sound.stop();
    }
  }
}

