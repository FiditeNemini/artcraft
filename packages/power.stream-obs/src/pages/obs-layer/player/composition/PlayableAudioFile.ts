
// TODO: Add twitch user data, and lots of other stats that might be useful 
// at audio play-time.
class PlayableAudioFile {

  private mediaUrl: string;

  constructor(mediaUrl: string) {
    this.mediaUrl = mediaUrl;
  }

  getUrl() : string {
    return this.mediaUrl;
  }
}

export default PlayableAudioFile;
