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
    return this.sessionStateResponse?.logged_in || false;
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

  public canEditUserProfile(username: string) : boolean {
    if (this.getUsername() === username) {
      return true;
    }
    return this.canEditOtherUsersProfiles();
  }

  public canDeleteW2lTemplateByUserToken(userToken?: string) : boolean {
    return this.canDeleteOtherUsersW2lTemplates() || this.verifyUserTokenMatch(userToken);
  }

  public canUseTts() : boolean {
    return this.sessionStateResponse?.user?.can_use_tts || true; // NB: Default true.
  }

  public canUseW2l() : boolean {
    return this.sessionStateResponse?.user?.can_use_w2l || true; // NB: Default true
  }

  public canUploadTtsModels() : boolean {
    return this.sessionStateResponse?.user?.can_upload_tts_models || false;
  }

  public canUploadW2lTemplates() : boolean {
    return this.sessionStateResponse?.user?.can_upload_w2l_templates || false;
  }

  public canBanUsers() : boolean {
    return this.sessionStateResponse?.user?.can_ban_users || false;
  }

  public canApproveW2lTemplates() : boolean {
    return this.sessionStateResponse?.user?.can_approve_w2l_templates || false;
  }

  public canEditOtherUsersProfiles() : boolean {
    return this.sessionStateResponse?.user?.can_edit_other_users_profiles || false;
  }

  public canDeleteOtherUsersW2lTemplates() : boolean {
    return this.sessionStateResponse?.user?.can_delete_other_users_w2l_templates || false;
  }

  private verifyUserTokenMatch(otherUserToken: string | null | undefined) : boolean {
    if (otherUserToken === null || otherUserToken === undefined || otherUserToken === "") {
      return false;
    }
    const ourUserToken = this.sessionStateResponse?.user?.user_token;
    if (ourUserToken === undefined || ourUserToken === "") {
      return false;
    }
    return ourUserToken === otherUserToken;
  }
}
