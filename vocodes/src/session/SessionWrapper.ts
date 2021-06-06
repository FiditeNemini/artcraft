import { SessionStateResponse } from "./SessionState";

/**
 * SessionWrapper can wrap each of the following states:
 * 
 *   1) non-existing session
 *   2) logged-out session
 *   3) logged-in session
 */
export class SessionWrapper {
  sessionStateResponse?: SessionStateResponse;

  private constructor(sessionStateResponse?: SessionStateResponse) {
    if (sessionStateResponse !== undefined) {
      this.sessionStateResponse = sessionStateResponse;
    }
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

  public getEmailGravatarHash() : string | undefined {
    return this.sessionStateResponse?.user?.email_gravatar_hash;
  }

  public canEditUser(username: string) : boolean {
    if (this.getUsername() === username) {
      return true;
    }
    return this.canEditOtherUsersData();
  }

  public canUseTts() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return true; // NB: Default true.
    }
    return this.sessionStateResponse.user.can_use_tts;
  }

  public canUseW2l() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return true; // NB: Default true.
    }
    return this.sessionStateResponse.user.can_use_w2l;
  }

  public canUploadTtsModels() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return false;
    }
    return this.sessionStateResponse.user.can_upload_tts_models;
  }

  public canUploadW2lTemplates() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return false;
    }
    return this.sessionStateResponse.user.can_upload_w2l_templates;
  }

  public canBanUsers() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return false;
    }
    return this.sessionStateResponse.user.can_ban_users;
  }

  public canEditOtherUsersData() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return false;
    }
    return this.sessionStateResponse.user.can_edit_other_users_data;
  }

  public canApproveW2lTemplates() : boolean {
    if (this.sessionStateResponse === undefined || this.sessionStateResponse.user === undefined) {
      return false;
    }
    return this.sessionStateResponse.user.can_approve_w2l_templates;
  }
}
