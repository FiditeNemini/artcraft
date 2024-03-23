import * as THREE from "three";

class AudioEngine {
  constructor() {
      this.listener = new THREE.AudioListener();
      this.clips = {};
  }

  addCamera(camera) {
      // Assuming you have a camera and you want to add the listener to it
      camera.add(this.listener);
  }

  loadClip(id, audioURL) {
      if (this.clips[id]) {
          console.warn(`AudioManager: AudioClip already exists with id "${id}".`);
          return;
      }

      const clip = new AudioClip(this.listener, audioURL);
      this.clips[id] = clip;
  }

  playClip(id) {
      const clip = this.clips[id];
      if (clip) {
          clip.play();
      } else {
          console.warn(`AudioManager: AudioClip with id "${id}" not found.`);
      }
  }

  stopClip(id) {
      const clip = this.clips[id];
      if (clip) {
          clip.stop();
      } else {
          console.warn(`AudioManager: AudioClip with id "${id}" not found.`);
      }
  }
}

export default AudioManager;
