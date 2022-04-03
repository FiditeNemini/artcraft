// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

declare module "buzz" {

  /** CTOR */
  interface SoundStatic {
    new(url: any): Sound;
  }

  /** Sound class */
  interface Sound {
    bind(events: string, callback: () => void): any;
    play(): any;
    stop(): any;
  }

  export var sound: SoundStatic;
}
