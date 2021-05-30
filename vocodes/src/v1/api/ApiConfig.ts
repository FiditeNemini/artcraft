
class ApiConfig {
  
  isLocalDev: boolean;

  constructor() {
    if (document.location.host.includes("localhost") ||
        document.location.host.includes("jungle.horse")) {
      this.isLocalDev = true;
    } else {
      this.isLocalDev = false;
    }
  }

  speakEndpoint() : string {
    return 'https://mumble.stream/speak_spectrogram';
  }

  speakSpectrogramEndpoint() : string {
    return 'https://mumble.stream/speak_spectrogram';
  }


  createAccount() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/create_account`;
  }

  login() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/login`;
  }

  logout() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/logout`;
  }

  sessionDetails() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/session`;
  }

  listTts() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/list`;
  }

  uploadTts() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/upload`;
  }

  uploadW2l() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/upload`;
  }

  listW2l() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/list`;
  }

  viewW2l(templateSlug: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateSlug}`;
  }

  inferW2l() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/inference`;
  }

  getProfile(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/profile/${username}`;
  }

  listW2lTemplatesForUser(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/w2l_templates`;
  }

  listW2lInferenceResultsForUser(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/w2l_results`;
  }


  private getScheme() : string {
    return this.isLocalDev ? "http" : "https";
  }

  private getNewApiHost() : string {
    // NB: `localhost` seems to have problems with cookies. 
    // I've added jungle.horse as a localhost mapped domain in /etc/hosts
    return this.isLocalDev ? "api.jungle.horse" : "api.vo.codes";
  }
}

export { ApiConfig }