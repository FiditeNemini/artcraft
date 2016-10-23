// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

import PIXI = require('pixi.js');

// TODO: Clean up this abysmal garbage.
export function setup_animation() {
  //let renderer = new PIXI.WebGLRenderer(800, 470);
  let renderer = PIXI.autoDetectRenderer(800, 470);
  renderer.backgroundColor = 0xffffff;

  document.getElementById('animation').appendChild(renderer.view);

  let stage = new PIXI.Container();

  let asset: any = null;
  let logo: any = null;

  (<any>window).animationState = null;
  let blinkingStart = null;
  let talkingStart = null;
  let start = null;
  let curFrame = 0;

  function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    if ((<any>window).animationState === 'blinking') {
      if (blinkingStart == null) {
        blinkingStart = window.performance.now();
        curFrame = 0;
      } else {
        let delta = window.performance.now() - blinkingStart;
        if (delta > 200) {
          curFrame = 0;
          blinkingStart = null;
          (<any>window).animationState = null;
        } else if (delta > 150) {
          curFrame = 4;
        } else if (delta > 60) {
          curFrame = 3;
        } else if (delta > 20) {
          curFrame = 2;
        } else if (delta > 10) {
          curFrame = 1;
        }
      }
    } else if ((<any>window).animationState === 'talking') {
      if (talkingStart == null) {
        talkingStart = window.performance.now();
        curFrame = 5;
      } else {
        let delta = window.performance.now() - talkingStart;
        if (delta > 550) {
          curFrame = 5;
          talkingStart = null;
          //(<any>window).animationState = null;
        } else if (delta > 580) {
          curFrame = 6;
        } else if (delta > 540) {
          curFrame = 7;
        } else if (delta > 500) {
          curFrame = 8;
        } else if (delta > 460) {
          curFrame = 9;
        } else if (delta > 420) {
          curFrame = 10;
        } else if (delta > 400) {
          curFrame = 11;
        } else if (delta > 360) {
          curFrame = 12;
        } else if (delta > 320) {
          curFrame = 13;
        } else if (delta > 280) {
          curFrame = 12;
        } else if (delta > 240) {
          curFrame = 11;
        } else if (delta > 200) {
          curFrame = 10;
        } else if (delta > 160) {
          curFrame = 9;
        } else if (delta > 120) {
          curFrame = 8;
        } else if (delta > 80) {
          curFrame = 7;
        } else if (delta > 40) {
          curFrame = 6;
        }
      }
    } else if ((<any>window).animationState === 'stop_talking') {
      if (curFrame > 13 || curFrame < 5) {
        (<any>window).animationState = null;
        curFrame = 0;
      } else {
        if (start == null) {
          start = window.performance.now();
        } 
        let delta = window.performance.now() - start;
        if (delta > 40) {
          curFrame -= 1;
          start = window.performance.now();
        }
      }
    }

    asset.gotoAndStop(curFrame);

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
  }

  let idleImages = [
    '/assets/images/trumpette/idle_0.png', // 0
    '/assets/images/trumpette/idle_1.png', // 1
    '/assets/images/trumpette/idle_2.png', // 2
    '/assets/images/trumpette/idle_3.png', // 3
    '/assets/images/trumpette/idle_4.png', // 4
  ];

  let talkImages = [
    '/assets/images/trumpette/talk_0.png', // 5
    '/assets/images/trumpette/talk_1.png', // 6
    '/assets/images/trumpette/talk_2.png', // 7
    '/assets/images/trumpette/talk_3.png', // 8
    '/assets/images/trumpette/talk_4.png', // 9
    '/assets/images/trumpette/talk_5.png', // 10
    '/assets/images/trumpette/talk_6.png', // 11
    '/assets/images/trumpette/talk_7.png', // 12
    '/assets/images/trumpette/talk_8.png', // 13
  ];

  let idleTextures = [];

  for (let image of idleImages) {
    let texture = PIXI.Texture.fromImage(image);
    idleTextures.push(texture);
  }

  for (let image of talkImages) {
    let texture = PIXI.Texture.fromImage(image);
    idleTextures.push(texture);
  }

  logo = new PIXI.Text('Jungle Horse', 
                   {font: '150px Impact Bold', fill: 0x000000, align: 'center'});

  PIXI.loader.add('asset', '/assets/images/trumpette/idle_0.png')
      .load(function (loader, resources) {
    // This creates a texture from a 'asset.png' image.
    //asset = new PIXI.Sprite(resources.asset.texture);
    asset = new PIXI.extras.MovieClip(idleTextures);

    // Setup the position and scale of the asset 
    asset.position.x = 200;
    asset.position.y = 0;

    asset.scale.x = 0.5;
    asset.scale.y = 0.5;

    logo.position.y = 260;

    // Add the asset to the scene we are building.
    stage.addChild(logo);
    stage.addChild(asset);

    asset.play();
    // kick off the animation loop (defined below)
    animate();
  });
  
  blinkAnimation();
}

export function talk() {
  (<any>window).animationState = 'talking';
}

export function stopTalking() {
  (<any>window).animationState = 'stop_talking';
}

function blink() {
  (<any>window).animationState = 'blinking';
}

function blinkAnimation() {
  if ((<any>window).animationState == null) {
    (<any>window).animationState = 'blinking';
  }
  let nextBlink = getRandomInt(1000, 4000);
  setTimeout(blinkAnimation, nextBlink);
}

function getRandomInt(min: number, max: number) : number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

