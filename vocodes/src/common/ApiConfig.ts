
export interface ListTtsInferenceResultsForUserArgs {
  username: string, 
  cursor?: string,
  cursor_is_reversed?: boolean,
  sort_ascending?: boolean,
  limit?: number
};

export interface ListW2lInferenceResultsForUserArgs {
  username: string, 
  cursor?: string,
  cursor_is_reversed?: boolean,
  sort_ascending?: boolean,
  limit?: number
};

enum Domain {
  Localhost,
  JungleHorse,
  Vocodes,
  FakeYou,
  Unknown,
}

class ApiConfig {
  
  domain: Domain;
  useSsl: boolean;

  constructor() {
    let useSsl = true;
    let domain = Domain.Unknown;

    if (document.location.host.includes("localhost")) {
      domain = Domain.Localhost;
      useSsl = false;
    } else if (document.location.host.includes("jungle.horse")) {
      domain = Domain.JungleHorse;
      useSsl = false;
    } else if (document.location.host.includes("vo.codes")) {
      domain = Domain.Vocodes;
    } else if (document.location.host.includes("fakeyou.com")) {
      domain = Domain.FakeYou;
    }

    this.domain = domain;
    this.useSsl = useSsl;
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

  viewTtsModel(modelSlug: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/model/${modelSlug}`;
  }

  deleteTtsModel(modelToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/model/${modelToken}/delete`;
  }

  editTtsModel(modelToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/model/${modelToken}/edit`;
  }

  getTtsModelUseCount(modelToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/model/${modelToken}/count`;
  }

  viewTtsInferenceResult(token: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/result/${token}`;
  }

  deleteTtsInferenceResult(resultToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/result/${resultToken}/delete`;
  }

  editTtsInferenceResult(resultToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/result/${resultToken}/edit`;
  }

  listTtsModelsForUser(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/tts_models`;
  }

  listTtsInferenceResultsForUser(params: ListTtsInferenceResultsForUserArgs) : string {
    const base_url = `${this.getScheme()}://${this.getNewApiHost()}/user/${params.username}/tts_results`;

    let query = "";
    let query_prepend = "?";

    if (params.cursor !== undefined) {
      query += `${query_prepend}cursor=${params.cursor}`;
      query_prepend = "&";

      if (params.cursor_is_reversed !== undefined) {
        query += `${query_prepend}cursor_is_reversed=${params.cursor_is_reversed}`;
      }
    }

    if (params.sort_ascending !== undefined) {
      query += `${query_prepend}sort_ascending=${params.sort_ascending}`;
      query_prepend = "&";
    }

    if (params.limit !== undefined) {
      query += `${query_prepend}limit=${params.limit}`;
    }

    return base_url + query;
  }

  getTtsInferenceJobState(jobToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/job/${jobToken}`;
  }

  getTtsModelUploadJobState(jobToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/upload_model_job/${jobToken}`;
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

  viewW2l(templateToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateToken}`;
  }

  viewW2lTemplate(templateToken: string) : string {
    return this.viewW2l(templateToken);
  }

  editW2lTemplate(templateToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateToken}/edit`;
  }

  deleteW2lTemplate(templateToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateToken}/delete`;
  }

  getW2lTemplateUseCount(templateSlug: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateSlug}/count`;
  }

  moderateW2l(templateSlug: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/template/${templateSlug}/moderate`;
  }

  viewW2lInferenceResult(token: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/result/${token}`;
  }

  editW2lInferenceResult(token: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/result/${token}/edit`;
  }

  deleteW2lInferenceResult(resultToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/result/${resultToken}/delete`;
  }

  inferTts() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/tts/inference`;
  }

  inferW2l() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/inference`;
  }

  getProfile(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/profile`;
  }

  editProfile(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/edit_profile`;
  }

  listW2lTemplatesForUser(username: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/user/${username}/w2l_templates`;
  }

  getW2lInferenceJobState(jobToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/job/${jobToken}`;
  }

  getW2lTemplateUploadJobState(jobToken: string) : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/w2l/upload_template_job/${jobToken}`;
  }

  listW2lInferenceResultsForUser(params: ListTtsInferenceResultsForUserArgs) : string {
    const base_url = `${this.getScheme()}://${this.getNewApiHost()}/user/${params.username}/w2l_results`;

    let query = "";
    let query_prepend = "?";

    if (params.cursor !== undefined) {
      query += `${query_prepend}cursor=${params.cursor}`;
      query_prepend = "&";

      if (params.cursor_is_reversed !== undefined) {
        query += `${query_prepend}cursor_is_reversed=${params.cursor_is_reversed}`;
      }
    }

    if (params.sort_ascending !== undefined) {
      query += `${query_prepend}sort_ascending=${params.sort_ascending}`;
      query_prepend = "&";
    }

    if (params.limit !== undefined) {
      query += `${query_prepend}limit=${params.limit}`;
    }

    return base_url + query;
  }

  firehoseEvents() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/events`;
  }

  getLeaderboard() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/leaderboard`;
  }

  getModerationIpBanList(): string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/ip_bans/list`;
  }

  createModerationIpBan(): string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/ip_bans/add`;
  }

  getModerationIpBan(ipAddress: string): string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/ip_bans/${ipAddress}`;
  }

  deleteModerationIpBan(ipAddress: string): string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/ip_bans/${ipAddress}/delete`;
  }

  banUser() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/user_bans/manage_ban`;
  }

  getModerationUserList() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/user/list`;
  }

  getTtsVoiceInventoryStats() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/stats/tts_voices`;
  }

  getTtsInferenceStats() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/jobs/tts_inference_queue_stats`;
  }

  getW2lInferenceStats() : string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/jobs/w2l_inference_queue_stats`;
  }

  getModerationPendingW2lTemplates(): string {
    return `${this.getScheme()}://${this.getNewApiHost()}/moderation/pending/w2l_templates`;
  }

  private getScheme() : string {
    return this.useSsl ? "https" : "http";
  }

  private getNewApiHost() : string {
    // NB: `localhost` seems to have problems with cookies. 
    // I've added jungle.horse as a localhost mapped domain in /etc/hosts
    switch (this.domain) {
      case Domain.Localhost:
      case Domain.JungleHorse:
        return "api.jungle.horse";
      case Domain.Vocodes:
        return "api.vo.codes";
      case Domain.FakeYou:
      case Domain.Unknown:
        return "api.fakeyou.com";
    }
  }
}

export { ApiConfig }