// Copyright (c) 2016 Brandon Thomas <bt@brand.io, echelon@gmail.com>

import PIXI = require('pixi.js');

import $ = require('jquery');
import { trumpAnimation } from './trump_animation';
import { getRandomInt } from './util';

/**
 * The image path on AWS is stored under a content hash.
 * This is injected into the meta tags before upload so we can build the path.
 */
function getImagePathPrefix() : string {
  // TODO: Cache the values looked up from the DOM statically.
  let environment = $('meta[name=environment]').attr('content');

  switch (environment.toLowerCase()) {
    case 'production':
      let cdnHost = $('meta[name=cdn_host]').attr('content');
      return `${cdnHost}/images`;
    default:
      return '/assets/images';
  }
}

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

  let prefix = getImagePathPrefix();

  let idleImages = [
    '/trumpette/idle_0.png', // 0
    '/trumpette/idle_1.png', // 1
    '/trumpette/idle_2.png', // 2
    '/trumpette/idle_3.png', // 3
    '/trumpette/idle_4.png', // 4
  ];

  let talkImages = [
    '/trumpette/talk_0.png', // 5
    '/trumpette/talk_1.png', // 6
    '/trumpette/talk_2.png', // 7
    '/trumpette/talk_3.png', // 8
    '/trumpette/talk_4.png', // 9
    '/trumpette/talk_5.png', // 10
    '/trumpette/talk_6.png', // 11
    '/trumpette/talk_7.png', // 12
    '/trumpette/talk_8.png', // 13
  ];

  let angryImages = [
    '/trumpette/angry_0.png', // 14
    '/trumpette/angry_1.png', // 15
    '/trumpette/angry_2.png', // 16
    '/trumpette/angry_3.png', // 17
    '/trumpette/angry_4.png', // 18
    '/trumpette/angry_5.png', // 19
    '/trumpette/angry_6.png', // 20
    '/trumpette/angry_7.png', // 21
    '/trumpette/angry_8.png', // 22
    '/trumpette/angry_between.png', // 23
  ];

  let idleTextures = [];

  for (let image of idleImages) {
    let texture = PIXI.Texture.fromImage(`${prefix}${image}`);
    idleTextures.push(texture);
  }

  for (let image of talkImages) {
    let texture = PIXI.Texture.fromImage(`${prefix}${image}`);
    idleTextures.push(texture);
  }

  for (let image of angryImages) {
    let texture = PIXI.Texture.fromImage(`${prefix}${image}`);
    idleTextures.push(texture);
  }

  //logo = new PIXI.Text('Jungle Horse',
  //                 {font: '150px Impact Bold', fill: 0x000000, align: 'center'});

  //let texture = PIXI.Texture.fromImage(`${prefix}/jungle_horse_lobster.png`);
  let texture = PIXI.Texture.fromImage(`${prefix}/trumped.png`);
  logo2 = new PIXI.Sprite(texture);

  PIXI.loader.add('asset', `${prefix}/trumpette/idle_0.png`)
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
