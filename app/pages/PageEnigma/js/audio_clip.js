import * as THREE from "three";

class AudioClip {

  constructor(listener, audioURL) {
      this.audioLoader = new THREE.AudioLoader();
      this.sound = new THREE.Audio(listener);
      this.audioURL = audioURL;
      this.isLoaded = false;

      // Load the audio file asynchronously
      this.audioLoader.load(audioURL, (buffer) => {
          this.sound.setBuffer(buffer);
          this.isLoaded = true;
      });
  }

  play() {
      if (this.isLoaded) {
          this.sound.play();
          this.sound.setLoop(true);
          this.sound.setVolume(1);
          this.sound.play();
      } else {
          console.warn(`AudioClip: Sound not loaded yet (${this.audioURL}).`);
      }
  }
  
  stop() {
      if (this.isLoaded) {
          this.sound.stop();
      }
  }
}