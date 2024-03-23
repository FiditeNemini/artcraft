class PlayableClip {
  constructor(name) {
    this.name = name;
    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
    console.log(`${this.name} is now playing.`);
    // Implementation of the play functionality
  }

  pause() {
    this.isPlaying = false;
    console.log(`${this.name} is paused.`);
    // Implementation of the pause functionality
  }

  stop() {
    this.isPlaying = false;
    console.log(`${this.name} has stopped.`);
    // Implementation of the stop functionality
  }
}

class AudioClip extends PlayableClip {
  constructor(name, duration, format,location) {
    super(name);
    this.duration = duration; // in seconds
    this.format = format; // e.g., 'mp3', 'wav'
    this.location = location; // url path
  }

  play() {
    super.play();
    // Additional implementation specific to AudioClip
    console.log(`Streaming audio for ${this.name}.`);
  }

  pause() {
    super.pause();
    // Additional implementation specific to AudioClip
    console.log(`Audio stream paused for ${this.name}.`);
  }

  stop() {
    super.stop();
    // Additional implementation specific to AudioClip
    console.log(`Audio stream stopped for ${this.name}.`);
  }
}

class AnimationClip extends PlayableClip {
  constructor(name, frames, fps) {
    super(name);
    this.frames = frames; // Total number of frames
    this.fps = fps; // Frames per second
  }

  play() {
    super.play();
    // Additional implementation specific to AnimationClip
    console.log(`Animation started for ${this.name}.`);
  }

  pause() {
    super.pause();
    // Additional implementation specific to AnimationClip
    console.log(`Animation paused for ${this.name}.`);
  }

  stop() {
    super.stop();
    // Additional implementation specific to AnimationClip
    console.log(`Animation stopped for ${this.name}.`);
  }
}

class GameObjectClip extends PlayableClip {
  constructor(name, positions) {
    super(name);
    this.positions = positions; // Array of position objects { x, y, z }
  }

  play() {
    super.play();
    // Additional implementation specific to GameObjectClip
    console.log(`GameObject movement started for ${this.name}.`);
  }

  pause() {
    super.pause();
    // Additional implementation specific to GameObjectClip
    console.log(`GameObject movement paused for ${this.name}.`);
  }

  stop() {
    super.stop();
    // Additional implementation specific to GameObjectClip
    console.log(`GameObject movement stopped for ${this.name}.`);
  }
}
