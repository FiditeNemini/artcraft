
class ApiConfig {
  
  isLocalDev: boolean;

  constructor() {
    if (document.location.host.includes("localhost")) {
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
    return `${this.getScheme()}://${this.getHost()}/create_account`;
  }

  login() : string {
    return `${this.getScheme()}://${this.getHost()}/login`;
  }

  logout() : string {
    return `${this.getScheme()}://${this.getHost()}/logout`;
  }

  sessionDetails() : string {
    return `${this.getScheme()}://${this.getHost()}/session`;
  }

  private getScheme() : string {
    return this.isLocalDev ? "http" : "https";
  }

  private getHost() : string {
    return this.isLocalDev ? "localhost:12345" : "mumble.stream";
  }
}

export { ApiConfig }