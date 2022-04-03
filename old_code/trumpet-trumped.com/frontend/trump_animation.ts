// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

enum TrumpState {
  Idle,
  Blinking,
  Talking,
  TalkingStop,
  AngryTalkingStart,
  AngryTalkingLoop,
  AngryTalkingStop,
}

/**
 * State machine that controls which animation state Trump is in, and
 * frame ticker to calculate the current frame at any given moment.
 */
class TrumpAnimation {

  private currentState: TrumpState;
  private currentFrame: number;
  private clock: number;

  constructor() {
    this.currentState = TrumpState.Idle;
    this.currentFrame = 0;
  }

  /**
   * Set Trump in the "blink" animation state.
   */
  blink() {
    if (this.currentState == TrumpState.Idle) {
      this.currentState = TrumpState.Blinking;
    }
  }

  /**
   * Set Trump in the "talk" animation state.
   */
  talk() {
    this.currentState = TrumpState.Talking;
  }

  /**
   * Set Trump in the "angry talk" animation state.
   */
  angryTalk() {
    this.currentState = TrumpState.AngryTalkingStart;
  }

  /**
   * Use a random talking animation.
   */
  talkRandom() {
    if (Math.random() >= 0.5) {
      this.talk();
    } else {
      this.angryTalk();
    }
  }

  /**
   * Stop trump from talking.
   */
  stopTalking() {
    switch(this.currentState) {
      case TrumpState.Talking:
        this.currentState = TrumpState.TalkingStop;
        break;
      case TrumpState.AngryTalkingStart:
      case TrumpState.AngryTalkingLoop:
        this.currentState = TrumpState.AngryTalkingStop;
        break;
      default:
        break;
    }
  }

  /**
   * Get the current frame index.
   */
  calculateCurrentFrame(): number {
    switch (this.currentState) {
      case TrumpState.Idle:
        this.currentFrame = 0;
        break;
      case TrumpState.Blinking:
        this.calculateBlinking();
        break;
      case TrumpState.Talking:
        this.calculateTalking();
        break;
      case TrumpState.TalkingStop:
        this.calculateTalkingStop();
        break;
      case TrumpState.AngryTalkingStart:
        this.calculateAngryTalkingStart();
        break;
      case TrumpState.AngryTalkingLoop:
        this.calculateAngryTalkingLoop();
        break;
      case TrumpState.AngryTalkingStop:
        this.calculateAngryTalkingStop();
        break;
      default:
        break;
    }

    return this.currentFrame;
  }

  private calculateBlinking() {
    if (this.clock == null) {
      this.clock = window.performance.now();
      this.currentFrame = 0;
    } else {
      let delta = window.performance.now() - this.clock;
      if (delta > 200) {
        this.currentFrame = 0;
        this.clock = null;
        this.currentState = TrumpState.Idle;
      } else if (delta > 150) {
        this.currentFrame = 4;
      } else if (delta > 60) {
        this.currentFrame = 3;
      } else if (delta > 20) {
        this.currentFrame = 2;
      } else if (delta > 10) {
        this.currentFrame = 1;
      }
    }
  }

  private calculateTalking() {
    if (this.clock == null) {
      this.clock = window.performance.now();
      this.currentFrame = 5;
    } else {
      let delta = window.performance.now() - this.clock;
      if (delta > 550) {
        this.currentFrame = 5;
        this.clock = null;
      } else if (delta > 580) {
        this.currentFrame = 6;
      } else if (delta > 540) {
        this.currentFrame = 7;
      } else if (delta > 500) {
        this.currentFrame = 8;
      } else if (delta > 460) {
        this.currentFrame = 9;
      } else if (delta > 420) {
        this.currentFrame = 10;
      } else if (delta > 400) {
        this.currentFrame = 11;
      } else if (delta > 360) {
        this.currentFrame = 12;
      } else if (delta > 320) {
        this.currentFrame = 13;
      } else if (delta > 280) {
        this.currentFrame = 12;
      } else if (delta > 240) {
        this.currentFrame = 11;
      } else if (delta > 200) {
        this.currentFrame = 10;
      } else if (delta > 160) {
        this.currentFrame = 9;
      } else if (delta > 120) {
        this.currentFrame = 8;
      } else if (delta > 80) {
        this.currentFrame = 7;
      } else if (delta > 40) {
        this.currentFrame = 6;
      }
    }
  }

  private calculateTalkingStop() {
    if (this.currentFrame > 13 || this.currentFrame < 5) {
      this.currentState = TrumpState.Idle;
      this.currentFrame = 0;
    } else {
      if (this.clock == null) {
        this.clock = window.performance.now();
      }
      let delta = window.performance.now() - this.clock;
      if (delta > 40) {
        this.currentFrame -= 1;
        this.clock = window.performance.now();
      }
    }
  }

  private calculateAngryTalkingStart() {
    const frame_rate = 50;
    if (this.clock == null) {
      this.clock = window.performance.now();
      this.currentFrame = 23;
    } else {
      let delta = window.performance.now() - this.clock;
      if (delta > frame_rate * 6) {
        this.currentFrame = 19;
        this.clock = null;
        this.currentState = TrumpState.AngryTalkingLoop;
      } else if (delta > frame_rate * 5) {
        this.currentFrame = 18;
      } else if (delta > frame_rate * 4) {
        this.currentFrame = 17;
      } else if (delta > frame_rate * 3) {
        this.currentFrame = 16;
      } else if (delta > frame_rate * 2) {
        this.currentFrame = 15;
      } else if (delta > frame_rate * 1) {
        this.currentFrame = 14;
      }
    }
  }

  private calculateAngryTalkingLoop() {
    const frame_rate = 80;
    if (this.clock == null) {
      this.clock = window.performance.now();
      this.currentFrame = 19;
    } else {
      let delta = window.performance.now() - this.clock;
      if (delta > frame_rate * 6) {
        this.currentFrame = 19;
        this.clock = window.performance.now();
      } else if (delta > frame_rate * 5) {
        this.currentFrame = 20;
      } else if (delta > frame_rate * 4) {
        this.currentFrame = 21;
      } else if (delta > frame_rate * 3) {
        this.currentFrame = 22;
      } else if (delta > frame_rate * 2) {
        this.currentFrame = 21;
      } else if (delta > frame_rate * 1) {
        this.currentFrame = 20;
      }
    }
  }

  private calculateAngryTalkingStop() {
    const frame_rate = 50;
    if ((this.currentFrame > 22 || this.currentFrame < 14) && this.currentFrame != 23) {
      // TODO FIXME - nasty code
      this.currentFrame = 23;
      this.clock = null;
    } else if (this.currentFrame == 23) {
      if (this.clock == null) {
        this.clock = window.performance.now();
      } else {
        let delta = window.performance.now() - this.clock;
        if (delta > frame_rate) {
          this.currentFrame = 0;
          this.clock = null;
          this.currentState = TrumpState.Idle;
        }
      }
    } else {
      if (this.clock == null) {
        this.clock = window.performance.now();
      }
      let delta = window.performance.now() - this.clock;
      if (delta > frame_rate) {
        this.currentFrame -= 1;
        this.clock = window.performance.now();
      }
    }
  }
}

export const trumpAnimation = new TrumpAnimation();

// TODO TEMP
(<any>window).trumpAnimation = trumpAnimation;
