import { StorytellerDomain } from "./DomainNames";

export class StorytellerUrlConfig {
  private domain: StorytellerDomain;
  private useSsl: boolean;

  constructor() {
    let useSsl = true;
    let domain = StorytellerDomain.Storyteller;

    if (document.location.host.includes("localhost")) {
      // NB: `localhost` seems to have problems with cookies. 
      // I've added jungle.horse as a localhost mapped domain in /etc/hosts,
      // This should be the preferred mechanism for local testing.
      domain = StorytellerDomain.Localhost;
      useSsl = document.location.protocol === 'https:';
    } else if (document.location.host.includes("jungle.horse")) {
      // NB: Also local dev. More friendly with cookies, CORS, etc.
      domain = StorytellerDomain.JungleHorse;
      useSsl = document.location.protocol === 'https:';
    }

    this.domain = domain;
    this.useSsl = useSsl;
  }

  twitchOauthEnrollRedirect() : string {
    return `${this.getScheme()}://${this.getApiHost()}/twitch/oauth/enroll_redirect_begin`;
  }

  // =============== API HOSTS ===============

  private getApiHost() : string {
    switch (this.domain) {
      case StorytellerDomain.Localhost:
        return 'localhost';
      case StorytellerDomain.JungleHorse:
        return 'api.jungle.horse';
      case StorytellerDomain.Storyteller:
      default:
        return 'api.storyteller.io';
    }
  }

  private getObsHost() : string {
    switch (this.domain) {
      case StorytellerDomain.Localhost:
        return 'localhost';
      case StorytellerDomain.JungleHorse:
        return 'obs.jungle.horse';
      case StorytellerDomain.Storyteller:
      default:
        return 'obs.storyteller.io';
    }
  }

  // =============== HTTP SCHEME ===============

  private getScheme(): string {
    return this.useSsl ? 'https' : 'http';
  }
}