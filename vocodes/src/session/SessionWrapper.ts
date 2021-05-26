import { SessionStateResponse } from "./SessionState";

export class SessionWrapper {
  sessionStateResponse?: SessionStateResponse;

  private constructor(sessionStateResponse?: SessionStateResponse) {
    this.sessionStateResponse = sessionStateResponse;
  }

  public static emptySession() : SessionWrapper {
    return new SessionWrapper();
  }

  public static wrapResponse(sessionStateResponse: SessionStateResponse) : SessionWrapper {
    return new SessionWrapper(sessionStateResponse);
  }

  public isLoggedIn() : boolean {
    if (this.sessionStateResponse === undefined) {
      return false;
    }
    return this.sessionStateResponse.logged_in;
  }

  public getUsername() : string | undefined {
    return this.sessionStateResponse?.user?.username;
  }

  public getDisplayName() : string | undefined {
    return this.sessionStateResponse?.user?.display_name;
  }
}
