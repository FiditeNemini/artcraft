import React from 'react';
import { AboutComponent } from './modes/about/AboutComponent';
import { ExtrasMode } from './modes/speak/SpeakComponent';
import { Footer } from './navigation/Footer';
import { HistoryComponent } from './modes/history/HistoryComponent';
import { Mode } from '../AppMode';
import { SpeakComponent } from './modes/speak/SpeakComponent';
import { Speaker, SpeakerCategory, SPEAKERS, SPEAKER_CATEGORIES, CATEGORY_ALL_BY_NAME, SPEAKERS_BY_CATEGORY } from './model/Speakers';
import { Spectrogram } from './modes/speak/extras/Spectrogram';
import { TermsComponent } from './modes/terms/TermsComponent';
import { TopNav } from './navigation/TopNav';
import { Utterance } from './model/utterance';
import { VideoComponent } from './modes/video/VideoComponent';
import { VideoJob, VideoJobStatus } from './modes/video/VideoJob';
import { VideoJobPoller } from './modes/video/VideoJobPoller';
import { VideoQueuePoller } from './modes/video/VideoQueuePoller';
import { VideoQueueStats } from './modes/video/VideoQueueStats';
import { ApiConfig } from '../common/ApiConfig';
import { SessionStateResponse } from './api/SessionState';
import { Link } from 'react-router-dom';
import { FrontendUrlConfig } from '../common/FrontendUrlConfig';
import { DiscordLink } from '../v2/view/_common/DiscordLink';
import { PatreonLink } from '../v2/view/_common/PatreonLink';

interface Props {
  // Certan browsers (iPhone) have pitiful support for drawing APIs. Worse yet,
  // they seem to lose the "touch event sandboxing" that allows for audio to be 
  // played after user interaction if the XHRs delivering the audio don't do so
  // as actual audio mimetypes. (Decoding from base64 and trying to play fails.)
  enableSpectrograms: boolean,
}

enum SpectrogramMode {
  VIRIDIS,
  CIVIDIS,
  PLASMA,
  INFERNO,
  MAGMA,
  GIST_HEAT,
  AFMHOT,
  PINK,
  BLACK_WHITE,
  BONE,
  COPPER,
  JET,
  RDBU,
  RDGY,
  SPRING,
  COOL,
}

const TEXT_CHARACTER_LIMIT_DEFAULT = 500;

interface State {
  // UI Primary Mode
  mode: Mode,

  // News Popup
  showNewsNotice: boolean,

  // TTS Mode State
  speaker: Speaker,
  extrasMode: ExtrasMode,
  currentSpectrogram?: Spectrogram,
  currentSpeakerCategory: SpeakerCategory,
  spectrogramMode: SpectrogramMode,
  currentText: string,

  // Video Mode State
  currentVideoJob?: VideoJob,
  videoQueueStats: VideoQueueStats,

  // Dynamic config
  textCharacterLimit: number,

  // Pollers
  videoQueuePoller: VideoQueuePoller,
  videoJobPoller: VideoJobPoller,

  // History
  utterances: Utterance[],
  isHistoryCountBadgeVisible: boolean,

  // Rollout of vocodes 2.0
  enableAlpha: boolean,
  loggedIn: boolean,
  sessionState?: SessionStateResponse,
}

// Responses from the `/service_settings` endpoint.
interface ServiceSettingsResponse {
  // Minimum characters to be sent in a request
  text_character_limit_min?: number,
  // Maximum characters to be sent in a request
  text_character_limit_max?: number,
}

class OldVocodesContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    // Random speaker marked as "default"
    const defaultSpeakers = SPEAKERS.filter(speaker => speaker.isDefaultVoice());
    const index = Math.floor(Math.random() * defaultSpeakers.length);
    const defaultSpeaker = defaultSpeakers[index]!;

    let showNewsNotice = true; // TODO(2021-04-06): Temporarily hiding (2021-05-10: Reenable.)

    // TODO: This is temporary!
    const enableAlpha = document.cookie.includes("enable-alpha");
    const loggedIn = false;

    if (enableAlpha) {
      showNewsNotice = false;
    }

    this.state = {
      enableAlpha: enableAlpha,
      loggedIn: loggedIn,
      mode: Mode.SPEAK_MODE,
      showNewsNotice: showNewsNotice, 
      extrasMode: ExtrasMode.SPEAKER_INFO,
      speaker: defaultSpeaker,
      spectrogramMode: SpectrogramMode.VIRIDIS,
      utterances: [],
      isHistoryCountBadgeVisible: false,
      currentText: '',
      textCharacterLimit: TEXT_CHARACTER_LIMIT_DEFAULT,
      currentSpeakerCategory: CATEGORY_ALL_BY_NAME,
      videoQueuePoller: new VideoQueuePoller(this.updateVideoQueueStats),
      videoJobPoller: new VideoJobPoller(this.updateVideoJob),
      videoQueueStats: VideoQueueStats.default(),
    };
  }

  componentDidMount() {
    this.querySession();
    this.startupQueryServiceSettings();
    setInterval(() => this.querySession, 10000);
    //this.state.videoJobPoller.start();
    //this.state.videoQueuePoller.start();
  }

  startupQueryServiceSettings() {
    const url = 'https://mumble.stream/service_settings';
    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      console.log('response', response);

      const settings : ServiceSettingsResponse = response;

      // TODO: We're only handling the max limit for now.
      if (settings.text_character_limit_max !== undefined) {
        this.setState({ textCharacterLimit: settings.text_character_limit_max });
      }
    })
    .catch(e => { /* Ignore. We'll just operate with the defaults. */ });
  }

  querySession = () => {
    if (!this.state.enableAlpha) {
      return;
    }

    const api = new ApiConfig();
    const endpointUrl = api.sessionDetails();

    fetch(endpointUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(res => res.json())
    .then(response => {
      const session : SessionStateResponse = response;

      if (session !== undefined) {
        this.setState({ 
          sessionState : session,
          loggedIn: session.logged_in,
        });
      }
    })
    .catch(e => { /* Ignore. */ });
  }

  logoutSession = () => {
    if (!this.state.enableAlpha) {
      return;
    }

    const api = new ApiConfig();
    const endpointUrl = api.logout();

    fetch(endpointUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(_raw_response => {
      this.querySession();
    })
    .catch(e => { /* Ignore. */ });
  }

  componentWillUnmount() {
    this.state.videoJobPoller.stop();
    this.state.videoQueuePoller.stop();
  }

  switchMode = (mode: Mode) => {
    this.setState({ mode: mode });
  }

  resetMode = () => {
    this.setState({ mode: Mode.SPEAK_MODE });
  }

  switchExtrasMode = (extrasMode: ExtrasMode) => {
    if (!this.props.enableSpectrograms && extrasMode === ExtrasMode.SPECTROGRAM) {
      return;
    }
    this.setState({ extrasMode: extrasMode });
  }

  setSpeaker = (speaker: Speaker) : void => {
    this.setState({ speaker: speaker });
  }

  setSpeakerCategoryBySlug = (speakerCategorySlug: string) : void => {
    let selectedSpeakerCategory = undefined;

    SPEAKER_CATEGORIES.forEach(category => {
      if (category.getSlug() === speakerCategorySlug) {
        selectedSpeakerCategory = category;
      }
    })

    if (selectedSpeakerCategory === undefined) {
      console.warn(`Invalid category: ${speakerCategorySlug}`)
      return;
    }

    const speakers = SPEAKERS_BY_CATEGORY.get(selectedSpeakerCategory);

    if (speakers === undefined || speakers.length === 0) {
      console.warn(`No speakers for category: ${speakerCategorySlug}`)
      return;
    }

    let selectedSpeaker = undefined;

    speakers.forEach(speaker => {
      if (speaker.getSlug() === this.state.speaker.getSlug()) {
        selectedSpeaker = speaker;
      }
    })

    if (selectedSpeaker === undefined) {
      selectedSpeaker = speakers[0];
    }

    this.setState({ 
      speaker: selectedSpeaker,
      currentSpeakerCategory: selectedSpeakerCategory,
      extrasMode: ExtrasMode.SPEAKER_INFO,
    });
  }

  setSpeakerBySlug = (speakerSlug: string) : void => {
    let selectedSpeaker : Speaker | undefined = undefined;

    SPEAKERS.forEach(speaker => {
      if (speaker.slug === speakerSlug) {
        selectedSpeaker = speaker;
      }
    })

    if (selectedSpeaker === undefined) {
      return;
    }

    const speakers = SPEAKERS_BY_CATEGORY.get(this.state.currentSpeakerCategory) || [];

    let isCategoryCorrect = speakers.find(speaker =>
      speaker.getSlug() === selectedSpeaker!.getSlug()) !== undefined;

    let category = isCategoryCorrect
      ? this.state.currentSpeakerCategory
      : CATEGORY_ALL_BY_NAME;

    this.setState({
      speaker: selectedSpeaker,
      extrasMode: ExtrasMode.SPEAKER_INFO,
      currentSpeakerCategory: category,
    });
  }

  updateSpectrogram = (spectrogram: Spectrogram) => {
    if (!this.props.enableSpectrograms) {
      return; // unsupported in iOS
    }
    this.setState({ 
      currentSpectrogram: spectrogram,
      extrasMode: ExtrasMode.SPECTROGRAM,
    });
  }

  setSpectrogramMode = (spectrogramMode: SpectrogramMode) : void => {
    this.setState({ spectrogramMode: spectrogramMode });
  }

  appendUtterance = (utterance: Utterance) => {
    let utterances = this.state.utterances.slice();
    utterances.unshift(utterance);
    this.setState({ 
      utterances: utterances,
      isHistoryCountBadgeVisible: true,
    });
  }

  setText = (text: string) => {
    this.setState({ currentText : text });
  }

  // Call this once when starting a brand new job.
  startVideoJob = (videoJob: VideoJob) => {
    this.state.videoJobPoller.setCurrentVideoJob(videoJob);
    this.state.videoJobPoller.start();
    this.setState({ currentVideoJob: videoJob });
  }

  // Call this on incremental job update ticks.
  updateVideoJob = (videoJob: VideoJob) => {
    switch (videoJob.jobStatus) {
      case VideoJobStatus.Completed:
      case VideoJobStatus.Failed:
        console.log('job done');
        this.state.videoJobPoller.stop();
        break;
      default:
        break;
    }

    this.setState({ currentVideoJob: videoJob });
  }

  updateVideoQueueStats = (videoQueueStats: VideoQueueStats) => {
    this.setState({ videoQueueStats: videoQueueStats });
  }

  clearHistoryCountBadge = () => {
    this.setState({ isHistoryCountBadgeVisible: false });
  }

  toggleNewsNotice = () => {
    let show = !this.state.showNewsNotice;
    this.setState({ showNewsNotice: show });
  }

  public render() {
    let component;
    switch (this.state.mode) {
      case Mode.SPEAK_MODE:
        component = <SpeakComponent 
          enableSpectrograms={this.props.enableSpectrograms}
          extrasMode={this.state.extrasMode}
          currentSpeaker={this.state.speaker} 
          currentSpeakerCategory={this.state.currentSpeakerCategory}
          currentSpectrogram={this.state.currentSpectrogram}
          currentText={this.state.currentText}
          textCharacterLimit={this.state.textCharacterLimit}
          showNewsNotice={this.state.showNewsNotice}
          changeSpeakerCallback={this.setSpeakerBySlug} 
          changeSpeakerCategoryCallback={this.setSpeakerCategoryBySlug} 
          changeSpectrogramCallback={this.updateSpectrogram} 
          changeExtrasModeCallback={this.switchExtrasMode}
          spectrogramMode={this.state.spectrogramMode}
          changeSpectrogramMode={this.setSpectrogramMode}
          appendUtteranceCallback={this.appendUtterance}
          setTextCallback={this.setText}
          toggleNewsNoticeCallback={this.toggleNewsNotice}
          />;
        break;
      case Mode.VIDEO_MODE:
        component = <VideoComponent
          currentVideoJob={this.state.currentVideoJob}
          videoQueuePoller={this.state.videoQueuePoller}
          videoQueueStats={this.state.videoQueueStats}
          startVideoJobCallback={this.startVideoJob}
          updateVideoJobCallback={this.updateVideoJob}
          updateVideoQueueStatsCallback={this.updateVideoQueueStats}
          />
        break;
      case Mode.HISTORY_MODE:
        component = <HistoryComponent 
          utterances={this.state.utterances} 
          resetModeCallback={this.resetMode}
          clearHistoryCountBadgeCallback={this.clearHistoryCountBadge}
          />
        break;
      case Mode.ABOUT_MODE:
        component = <AboutComponent resetModeCallback={this.resetMode} />;
        break;
      case Mode.TERMS_MODE:
        component = <TermsComponent resetModeCallback={this.resetMode} />;
        break;
    }
    return (
      <div id="main" className="mainwrap">
        <div id="viewable">
          <TopNav 
            enableAlpha={this.state.enableAlpha}
            sessionState={this.state.sessionState}
            mode={this.state.mode} 
            historyBadgeCount={this.state.utterances.length}
            isHistoryCountBadgeVisible={this.state.isHistoryCountBadgeVisible}
            switchModeCallback={this.switchMode}
            logoutHandler={this.logoutSession}
            />
          
          <div className="notification is-danger">
            <strong>Old Vocodes is down until February 1st.</strong>
            <p>We're working really hard on new features, but we'll bring back the Old Vocodes (GlowTTS) voices soon.</p>
            <p>Please use the main <Link to={FrontendUrlConfig.indexPage()}>FakeYou website</Link> for now.</p>
            <p>If you want to support us, please 
              <DiscordLink text="join our Discord" iconAfterText={true} /> or 
              <PatreonLink text="support us on Patreon" iconAfterText={true} /></p>
          </div>

          {component}
        </div>
        <Footer mode={this.state.mode} switchModeCallback={this.switchMode} />
      </div>
    );
  }
}

export { OldVocodesContainer, SpectrogramMode };
