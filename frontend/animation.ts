// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

import PIXI = require('pixi.js');

import { trumpAnimation } from './trump_animation';
import { getRandomInt } from './util';

// TODO: Clean up this abysmal garbage.
export function setup_animation() {
  let renderer = PIXI.autoDetectRenderer(800, 470);
  renderer.backgroundColor = 0xffffff;

  document.getElementById('animation').appendChild(renderer.view);

  let stage = new PIXI.Container();

  let asset: any = null;
  let logo2: any = null;

  function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    let curFrame = trumpAnimation.calculateCurrentFrame();

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

  let angryImages = [
    '/assets/images/trumpette/angry_0.png', // 14
    '/assets/images/trumpette/angry_1.png', // 15
    '/assets/images/trumpette/angry_2.png', // 16
    '/assets/images/trumpette/angry_3.png', // 17
    '/assets/images/trumpette/angry_4.png', // 18
    '/assets/images/trumpette/angry_5.png', // 19
    '/assets/images/trumpette/angry_6.png', // 20
    '/assets/images/trumpette/angry_7.png', // 21
    '/assets/images/trumpette/angry_8.png', // 22
    '/assets/images/trumpette/angry_between.png', // 23
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

  for (let image of angryImages) {
    let texture = PIXI.Texture.fromImage(image);
    idleTextures.push(texture);
  }

  //logo = new PIXI.Text('Jungle Horse',
  //                 {font: '150px Impact Bold', fill: 0x000000, align: 'center'});

  let texture = PIXI.Texture.fromImage('/assets/images/jungle_horse_lobster.png');
  logo2 = new PIXI.Sprite(texture);

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

    //logo.position.y = 260;
    logo2.scale.x = 0.5;
    logo2.scale.y = 0.5;
    logo2.position.y = 160;

    // Add the asset to the scene we are building.
    //stage.addChild(logo);
    stage.addChild(logo2);
    stage.addChild(asset);

    asset.play();
    // kick off the animation loop (defined below)
    animate();
  });
  
  blinkAnimation();
}

function blinkAnimation() {
  trumpAnimation.blink();
  let nextBlink = getRandomInt(1000, 4000);
  setTimeout(blinkAnimation, nextBlink);
}
