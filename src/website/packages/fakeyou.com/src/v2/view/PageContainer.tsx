import React from "react";
import ComponentsLibrary from "./pages/components_library";
import { AboutPage } from "./pages/about/about_page/AboutPage";
import { GuidePage } from "./pages/about/guide_page/GuidePage";
import { FirehoseEventListPage } from "./pages/firehose/FirehoseEventListPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ModerationPage } from "./pages/moderation/moderation_main/ModerationPage";
import { ModerationIpBanListFc } from "./pages/moderation/moderation_ip_ban_list/ModerationIpBanListFc";
import { ModerationViewIpBanFc } from "./pages/moderation/moderation_view_ip_ban/ModerationViewIpBanFc";
import FaceAnimator from "./pages/face_animator";
import VideoMocap from "./pages/video_mocap";
import { ProfileEditFc } from "./pages/profile/profile_edit/ProfileEditFc";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { SignupPage } from "./pages/signup/SignupPage";
import {
  Switch,
  Route,
  withRouter,
  RouteComponentProps,
} from "react-router-dom";
import { TermsPage } from "./pages/about/terms_page/TermsPage";
import { TtsModelDeletePage } from "./pages/tts/tts_model_delete/TtsModelDeletePage";
import { TtsModelEditPage } from "./pages/tts/tts_model_edit/TtsModelEditPage";
import { TtsModelViewPage } from "./pages/tts/tts_model_view/TtsModelViewPage";
import { TtsResultDeletePage } from "./pages/tts/tts_result_delete/TtsResultDeletePage";
import { TtsResultViewPage } from "./pages/tts/tts_result_view/TtsResultViewPage";
import { ContributeIndexPage } from "./pages/contribute/ContributeIndexPage";

import { UploadTtsModelPage } from "./pages/upload/UploadTtsModelPage";
import UploadSdWeightPage from "./pages/upload/UploadSdWeightPage";
import UploadLoraWeightPage from "./pages/upload/UploadLoraWeightPage";
import UploadWorkflowPage from "./pages/upload/UploadWorkflowPage";

import { W2lResultViewPage } from "./pages/w2l/w2l_result_view/W2lResultViewPage";
import { W2lTemplateListPage } from "./pages/w2l/w2l_template_list/W2lTemplateListPage";
import { TtsResultEditPage } from "./pages/tts/tts_result_edit/TtsResultEditPage";
import { W2lResultEditPage } from "./pages/w2l/w2l_result_edit/W2lResultEditPage";
import { W2lTemplateDeletePage } from "./pages/w2l/w2l_template_delete/W2lTemplateDeletePage";
import { W2lTemplateEditPage } from "./pages/w2l/w2l_template_edit/W2lTemplateEditPage";
import { W2lResultDeletePage } from "./pages/w2l/w2l_result_delete/W2lResultDeletePage";
import { W2lTemplateApprovePage } from "./pages/w2l/w2l_template_approve/W2lTemplateApprovePage";
// import { TtsModelListPage } from "./pages/tts/tts_model_list/TtsModelListPage";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { ProfileBanFc } from "./pages/profile/profile_ban/ProfileBanFc";
import { ModerationUserListFc } from "./pages/moderation/moderation_user_list/ModerationUserList";
import { LeaderboardPage } from "./pages/leaderboard/LeaderboardPage";
import { ModerationJobStatsFc } from "./pages/moderation/moderation_job_stats/ModerationJobStatsFc";
import { ModerationUserFeatureFlagsPage } from "./pages/moderation/moderation_user_feature_flags/ModerationUserFeatureFlagsPage";
import { ModerationPendingW2lTemplatesFc } from "./pages/moderation/moderation_pending_w2l_templates/ModerationPendingW2lTemplatesFc";
import { ModerationVoiceStatsFc } from "./pages/moderation/moderation_voice_stats/ModerationVoiceStatsFc";
import { CreateCategoryPage } from "./pages/category/CreateCategoryPage";
import { TtsEditCategoriesPage } from "./pages/tts/tts_edit_categories/TtsEditCategoriesPage";
import { ModerationTtsCategoryListPage } from "./pages/moderation/categories/ModerationTtsCategoryListPage";
import { ModerationTtsCategoryEditPage } from "./pages/moderation/categories/ModerationTtsCategoryEditPage";
import { ModerationCategoryDeletePage } from "./pages/moderation/categories/ModerationCategoryDeletePage";
import { TtsCategoryType } from "../../AppWrapper";
import { PatronPage } from "./pages/patrons/PatronPage";
import { Language } from "@storyteller/components/src/i18n/Language";
import { VoiceCloneRequestPage } from "./pages/clone_voice_requests/VoiceCloneRequestPage";
import { VocodesPage } from "./pages/vocodes/VocodesPage";

import { PricingPage } from "./pages/premium/PricingPage";
import { WelcomePage } from "./pages/welcome/WelcomePage";
import { CheckoutSuccessPage } from "./pages/premium/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./pages/premium/CheckoutCancelPage";
import { PortalSuccessPage } from "./pages/premium/PortalSuccessPage";
import { PrivacyPage } from "./pages/about/privacy_page/PrivacyPage";
import { GetComputedTtsCategoryAssignmentsSuccessResponse } from "@storyteller/components/src/api/category/GetComputedTtsCategoryAssignments";
import { NewsPage } from "./pages/news/NewsPage";
import { LandingPage } from "./pages/landing/LandingPage";
import { ChannelsPage } from "./pages/channels/Channels";
import { TrumpTtsPage } from "./pages/character/trump/TrumpTtsPage";
//import { LandingPage } from "./pages/landing/LandingPage";
// import { VcModelListPage } from "./pages/vc/vc_model_list/VcModelListPage";

import { VoiceConversionModelListItem } from "@storyteller/components/src/api/voice_conversion/ListVoiceConversionModels";
import { CommunityCommissionsPage } from "./pages/contest/CommunityCommissionsPage";
import { ProductUsageInfoPage } from "./pages/product_usage_info/ProductUsageInfoPage";
import { GenerateSpeechPage } from "./pages/generate_speech/GenerateSpeechPage";
import VcModelViewPage from "./pages/vc/vc_model_view/VcModelViewPage";
import VcModelEditPage from "./pages/vc/vc_model_edit/VcModelEditPage";
import VcModelDeletePage from "./pages/vc/vc_model_delete/VcModelDeletePage";
// import { StorytellerStudioListPage } from "./pages/storyteller_studio/StorytellerStudioPage";
import TopNav from "components/layout/TopNav/TopNav";
// import MediaPage from "./pages/media/MediaPage";
import MediaPageSwitch from "./pages/media/MediaPageSwitch";
// import DevMediaPage from "./pages/media/DevMediaPage";
import EditCoverImage from "./pages/media/EditCoverImage";
import MediaRenamePage from "./pages/media/MediaRenamePage";
import { VoiceDesignerFormPage } from "./pages/voice_designer/VoiceDesignerFormPage";
import { VoiceDesignerMainPage } from "./pages/voice_designer/VoiceDesignerMainPage";
import { VoiceDesignerVoiceEditPage } from "./pages/voice_designer/VoiceDesignerVoiceEditPage";
import VoiceDesignerUseVoicePage from "./pages/voice_designer/VoiceDesignerUseVoicePage";
import { PasswordResetEmailPage } from "./pages/password_reset/PasswordResetEmailPage";
import { PasswordResetVerificationPage } from "./pages/password_reset/PasswordResetVerificationPage";
// import EngineCompositor from "./pages/EngineCompositor/EngineCompositor";
import InferenceJobsPage from "./pages/inference_jobs_page/InferenceJobsPage";
// import { NewProfilePage } from "./pages/profile/profile_view/NewProfilePage";
import { ModerationJobControlPage } from "./pages/moderation/job_control/ModerationJobControlPage";
import WeightPage from "./pages/weight/WeightPage";
import ExplorePage from "./pages/explore/ExplorePage";
import SearchPage from "./pages/search/SearchPage";
import { SearchProvider } from "context/SearchContext";
import WeightEditPage from "./pages/weight/WeightEditPage";

import FbxToGltfPage from "./pages/fbx_to_gltf/FbxToGltfPage";

import VideoWorkflowPage from "./pages/video_workflow/VideoWorkflow";
import ScrollToTop from "./_common/ScrollToTop";
import TextToImagePage from "./pages/text_to_image/TextToImagePage";
import DomainConfigProvider from "context/DomainConfigContext";
import DevUpload from "./pages/dev_upload/DevUpload";
import DevMediaInput from "./pages/dev_upload/DevMediaInput";
import NewTTS from "./pages/audio_gen/tts/NewTTS";
import NewVC from "./pages/audio_gen/vc/NewVC";
import DashboardPage from "./pages/dashboard/DashboardPage";
import DevUploadAlt from "./pages/dev_upload/DevUploadAlt";
import { ModerationTokenInfoPage } from "./pages/moderation/ModerationTokenInfoPage";
import StyleVideo from "./pages/style-video";
// import AIFaceMirror from "./pages/ai_face_mirror";
import CreateBetaKeyPage from "./pages/beta_key/CreateBetaKeyPage";
import RedeemBetaKeyPage from "./pages/beta_key/RedeemBetaKeyPage";
import RedeemSuccessPage from "./pages/beta_key/RedeemSuccessPage";
import BetaKeysListPage from "./pages/beta_key/BetaKeysListPage";
import { ProfilePageV3 } from "./pages/profile/profile_view/ProfilePageV3";
import ProfileSidePanel from "components/layout/ProfileSidePanel/ProfileSidePanel";
import CreatorToolsPage from "./pages/creator_tools/CreatorToolsPage";
import WaitlistNextStepsPage from "./pages/waitlist_next_steps/WaitlistNextStepsPage";
import { CreatorTypeformPage } from "./pages/landing/storyteller/PostlaunchLanding/CreatorTypeformPage";
import SignUpSuccessPage from "./pages/beta_key/SignUpSuccessPage";
import { StudioMobileCheckPage } from "./pages/landing/storyteller/PostlaunchLanding/StudioMobileCheckPage";
import { UploadNewTtsModelPage } from "./pages/upload/UploadNewTtsModelPage";
import LivePortrait from "./pages/live_portrait/LivePortrait";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionAction: () => void;

  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  querySessionSubscriptionsAction: () => void;

  isShowingVocodesNotice: boolean;
  clearVocodesNotice: () => void;

  isShowingLangaugeNotice: boolean;
  clearLanguageNotice: () => void;
  displayLanguage: Language;
  primaryLanguageCode: string;

  isShowingTwitchTtsNotice: boolean;
  clearTwitchTtsNotice: () => void;

  isShowingPleaseFollowNotice: boolean;
  clearPleaseFollowNotice: () => void;

  isShowingBootstrapLanguageNotice: boolean;
  clearBootstrapLanguageNotice: () => void;

  textBuffer: string;
  setTextBuffer: (textBuffer: string) => void;
  clearTextBuffer: () => void;

  ttsModels: Array<TtsModelListItem>;
  setTtsModels: (ttsVoices: Array<TtsModelListItem>) => void;

  allTtsCategories: TtsCategoryType[];
  setAllTtsCategories: (allTtsCategories: TtsCategoryType[]) => void;

  computedTtsCategoryAssignments?: GetComputedTtsCategoryAssignmentsSuccessResponse;
  setComputedTtsCategoryAssignments: (
    categoryAssignments: GetComputedTtsCategoryAssignmentsSuccessResponse
  ) => void;

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;
  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;

  selectedTtsLanguageScope: string;
  setSelectedTtsLanguageScope: (selectedTtsLanguageScope: string) => void;

  voiceConversionModels: Array<VoiceConversionModelListItem>;
  setVoiceConversionModels: (
    ttsVoices: Array<VoiceConversionModelListItem>
  ) => void;

  maybeSelectedVoiceConversionModel?: VoiceConversionModelListItem;
  setMaybeSelectedVoiceConversionModel: (
    maybeSelectedVoiceConversionModel: VoiceConversionModelListItem
  ) => void;
}

interface State {}

class PageContainer extends React.Component<
  Props & RouteComponentProps,
  State
> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {};
  }

  logout = () => {};

  public render() {
    return (
      <DomainConfigProvider>
        <SearchProvider>
          <ScrollToTop />
          <div id="wrapper" className="no-padding">
            <div id="overlay"></div>

            <TopNav
              sessionWrapper={this.props.sessionWrapper}
              logoutHandler={this.logout}
              querySessionCallback={this.props.querySessionAction}
              querySessionSubscriptionsCallback={
                this.props.querySessionSubscriptionsAction
              }
            />

            <ProfileSidePanel
              sessionWrapper={this.props.sessionWrapper}
              sessionSubscriptionsWrapper={
                this.props.sessionSubscriptionsWrapper
              }
            />

            <div id="page-content-wrapper">
              <Switch>
                <Route path="/comp-lib">
                  <ComponentsLibrary
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>
                <Route path="/firehose">
                  <FirehoseEventListPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/news">
                  <NewsPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                <Route path="/channels">
                  <ChannelsPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                <Route path="/leaderboard">
                  <LeaderboardPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/login">
                  <LoginPage
                    sessionWrapper={this.props.sessionWrapper}
                    querySessionAction={this.props.querySessionAction}
                    querySessionSubscriptionsAction={
                      this.props.querySessionSubscriptionsAction
                    }
                  />
                </Route>

                <Route path="/password-reset/verify">
                  <PasswordResetVerificationPage
                    sessionWrapper={this.props.sessionWrapper}
                    querySessionAction={this.props.querySessionAction}
                    querySessionSubscriptionsAction={
                      this.props.querySessionSubscriptionsAction
                    }
                  />
                </Route>

                <Route path="/password-reset">
                  <PasswordResetEmailPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/profile/:username/edit">
                  <ProfileEditFc sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/profile/:username/ban">
                  <ProfileBanFc sessionWrapper={this.props.sessionWrapper} />
                </Route>

                {/* Old Profile Page */}
                {/* <Route path="/profile/:username">
                    <NewProfilePage
                      sessionWrapper={this.props.sessionWrapper}
                      sessionSubscriptionsWrapper={
                        this.props.sessionSubscriptionsWrapper
                      }
                    />
                  </Route> */}

                <Route path="/profile/:username">
                  <ProfilePageV3
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                <Route path="/signup">
                  <SignupPage
                    querySessionCallback={() => {}}
                    sessionWrapper={this.props.sessionWrapper}
                    querySessionAction={this.props.querySessionAction}
                  />
                </Route>

                <Route path="/pricing" exact={true}>
                  <PricingPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                <Route path="/checkout_success" exact={true}>
                  <CheckoutSuccessPage
                    querySessionCallback={() => {}}
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>
                <Route path="/checkout_cancel" exact={true}>
                  <CheckoutCancelPage
                    querySessionCallback={() => {}}
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>
                <Route path="/portal_success" exact={true}>
                  <PortalSuccessPage
                    querySessionCallback={() => {}}
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/media/rename/:media_file_token">
                  <MediaRenamePage />
                </Route>

                <Route path="/media/:token">
                  <MediaPageSwitch />
                </Route>

                {/*                <Route path="/media/:token">
                    <MediaPage />
                  </Route>*/}

                {/*                 <Route path="/dev-media/:token">
                    <DevMediaPage />
                  </Route>*/}

                <Route path="/edit-cover-image/:token">
                  <EditCoverImage />
                </Route>

                <Route path="/explore">
                  <ExplorePage />
                </Route>

                <Route path="/weight/:weight_token/edit">
                  <WeightEditPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route
                  path="/weight/:weight_token/:maybe_url_slug?"
                  render={props => (
                    <WeightPage
                      key={props.match.params.weight_token}
                      sessionSubscriptionsWrapper={
                        this.props.sessionSubscriptionsWrapper
                      }
                    />
                  )}
                />

                <Route path="/search/weights">
                  <SearchPage />
                </Route>

                <Route path="/tts/result/:token/edit">
                  <TtsResultEditPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/result/:token/delete">
                  <TtsResultDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/result/:token">
                  <TtsResultViewPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/:token/edit">
                  <TtsModelEditPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/:token/delete">
                  <TtsModelDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/:token/categories">
                  <TtsEditCategoriesPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/tts/:token">
                  <TtsModelViewPage
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                    textBuffer={this.props.textBuffer}
                    setTextBuffer={this.props.setTextBuffer}
                    clearTextBuffer={this.props.clearTextBuffer}
                  />
                </Route>

                <Route path="/w2l/result/:token/edit">
                  <W2lResultEditPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/w2l/result/:token/delete">
                  <W2lResultDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/w2l/result/:token">
                  <W2lResultViewPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/w2l/:templateToken/edit">
                  <W2lTemplateEditPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/w2l/:templateToken/approval">
                  <W2lTemplateApprovePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/w2l/:templateToken/delete">
                  <W2lTemplateDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/video">
                  <W2lTemplateListPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/upload/tts">
                  <UploadTtsModelPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/upload/tts_model">
                  <UploadNewTtsModelPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/upload/sd">
                  <UploadSdWeightPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/upload/lora">
                  <UploadLoraWeightPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/upload/workflow">
                  <UploadWorkflowPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/contribute">
                  <ContributeIndexPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/user/list">
                  <ModerationUserListFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/user_feature_flags/:username?">
                  <ModerationUserFeatureFlagsPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/ip_bans/:ipAddress">
                  <ModerationViewIpBanFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/ip_bans">
                  <ModerationIpBanListFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/voice_stats">
                  <ModerationVoiceStatsFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/job_stats">
                  <ModerationJobStatsFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/job_control">
                  <ModerationJobControlPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>
                <Route path="/moderation/token_info">
                  <ModerationTokenInfoPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/tts_category/list">
                  <ModerationTtsCategoryListPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/tts_category/edit/:token">
                  <ModerationTtsCategoryEditPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/category/delete/:token">
                  <ModerationCategoryDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation/approve/w2l_templates">
                  <ModerationPendingW2lTemplatesFc
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/moderation">
                  <ModerationPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route exact={true} path="/clone">
                  <VoiceCloneRequestPage />
                </Route>

                <Route path="/patrons">
                  <PatronPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/product-usage">
                  <ProductUsageInfoPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/voice-conversion/:token/delete">
                  <VcModelDeletePage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/voice-conversion/:token/edit">
                  <VcModelEditPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/voice-conversion/:token">
                  <VcModelViewPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                    setMaybeSelectedInferenceJob={
                      this.props.maybeSelectedVoiceConversionModel
                    }
                  />
                </Route>

                {/* <Route path="/voice-conversion">
                    <VcModelListPage
                      sessionWrapper={this.props.sessionWrapper}
                      sessionSubscriptionsWrapper={
                        this.props.sessionSubscriptionsWrapper
                      }
                      voiceConversionModels={this.props.voiceConversionModels}
                      setVoiceConversionModels={
                        this.props.setVoiceConversionModels
                      }
                      maybeSelectedVoiceConversionModel={
                        this.props.maybeSelectedVoiceConversionModel
                      }
                      setMaybeSelectedVoiceConversionModel={
                        this.props.setMaybeSelectedVoiceConversionModel
                      }
                    />
                  </Route> */}

                <Route path="/dashboard">
                  <DashboardPage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/welcome-to-studio">
                  <WelcomePage sessionWrapper={this.props.sessionWrapper} />
                </Route>

                <Route path="/about">
                  <AboutPage />
                </Route>

                <Route path="/face-animator/:mediaToken?">
                  <FaceAnimator
                    {...{
                      sessionSubscriptionsWrapper:
                        this.props.sessionSubscriptionsWrapper,
                    }}
                  />
                </Route>

                <Route path="/fbx-to-gltf/:mediaToken?">
                  <FbxToGltfPage />
                </Route>

                {/*
                  // <Route path="/studio/:mediaToken?">
                  //   <StorytellerStudioListPage
                  //     sessionWrapper={this.props.sessionWrapper}
                  //     sessionSubscriptionsWrapper={
                  //       this.props.sessionSubscriptionsWrapper
                  //     }
                  //   />
                  // </Route>
                    */}

                <Route path="/commissions">
                  <CommunityCommissionsPage />
                </Route>

                <Route path="/terms">
                  <TermsPage />
                </Route>

                <Route path="/privacy">
                  <PrivacyPage />
                </Route>

                <Route path="/guide">
                  <GuidePage />
                </Route>

                <Route path="/old">
                  <VocodesPage />
                </Route>

                <Route path="/dev-upload">
                  <DevUpload />
                </Route>

                <Route path="/dev-upload-alt">
                  <DevUploadAlt />
                </Route>

                <Route path="/dev-media-input">
                  <DevMediaInput />
                </Route>

                {/* NEW TTS PAGE */}
                <Route exact path="/tts">
                  <NewTTS
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                {/* NEW VC PAGE */}
                <Route exact path="/voice-conversion">
                  <NewVC
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                {/* NEW LIVE PORTRAIT PAGE */}
                <Route exact path="/ai-live-portrait">
                  <LivePortrait
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                {/* Route for initial voice creation */}
                <Route exact path="/voice-designer/create">
                  <VoiceDesignerFormPage
                    {...{
                      sessionWrapper: this.props.sessionWrapper,
                      sessionSubscriptionsWrapper:
                        this.props.sessionSubscriptionsWrapper,
                    }}
                  />
                </Route>

                {/* Route for editing the dataset details */}
                <Route exact path="/voice-designer/dataset/:dataset_token/edit">
                  <VoiceDesignerFormPage
                    {...{
                      sessionWrapper: this.props.sessionWrapper,
                      sessionSubscriptionsWrapper:
                        this.props.sessionSubscriptionsWrapper,
                    }}
                  />
                </Route>

                {/* Route for handling dataset token for uploading samples */}
                <Route
                  exact
                  path="/voice-designer/dataset/:dataset_token/upload"
                >
                  <VoiceDesignerFormPage
                    {...{
                      sessionWrapper: this.props.sessionWrapper,
                      sessionSubscriptionsWrapper:
                        this.props.sessionSubscriptionsWrapper,
                    }}
                  />
                </Route>

                <Route path="/voice-designer/voice/:voice_token/edit">
                  <VoiceDesignerVoiceEditPage />
                </Route>

                <Route path="/voice-designer/voice/:voice_token">
                  <VoiceDesignerUseVoicePage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>

                <Route path="/inference-jobs-list">
                  <InferenceJobsPage />
                </Route>

                <Route path="/voice-designer">
                  <VoiceDesignerMainPage />
                </Route>

                <Route path="/style-video/:mediaToken?">
                  <StyleVideo />
                </Route>

                <Route path="/generate-speech">
                  <GenerateSpeechPage />
                </Route>

                <Route path="/video-mocap/:mediaToken?">
                  <VideoMocap
                    {...{
                      sessionWrapper: this.props.sessionWrapper,
                    }}
                  />
                </Route>

                <Route path="/video-workflow">
                  <VideoWorkflowPage
                    {...{
                      sessionWrapper: this.props.sessionWrapper,
                    }}
                  />
                </Route>

                <Route path="/text-to-image">
                  <TextToImagePage
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/character/donald-trump">
                  <TrumpTtsPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                    textBuffer={this.props.textBuffer}
                    setTextBuffer={this.props.setTextBuffer}
                    clearTextBuffer={this.props.clearTextBuffer}
                    ttsModels={this.props.ttsModels}
                    setTtsModels={this.props.setTtsModels}
                    allTtsCategories={this.props.allTtsCategories}
                    setAllTtsCategories={this.props.setAllTtsCategories}
                    allTtsCategoriesByTokenMap={
                      this.props.allTtsCategoriesByTokenMap
                    }
                    computedTtsCategoryAssignments={
                      this.props.computedTtsCategoryAssignments
                    }
                    setComputedTtsCategoryAssignments={
                      this.props.setComputedTtsCategoryAssignments
                    }
                    allTtsModelsByTokenMap={this.props.allTtsModelsByTokenMap}
                    ttsModelsByCategoryToken={
                      this.props.ttsModelsByCategoryToken
                    }
                    dropdownCategories={this.props.dropdownCategories}
                    setDropdownCategories={this.props.setDropdownCategories}
                    selectedCategories={this.props.selectedCategories}
                    setSelectedCategories={this.props.setSelectedCategories}
                    maybeSelectedTtsModel={this.props.maybeSelectedTtsModel}
                    setMaybeSelectedTtsModel={
                      this.props.setMaybeSelectedTtsModel
                    }
                    selectedTtsLanguageScope={
                      this.props.selectedTtsLanguageScope
                    }
                    setSelectedTtsLanguageScope={
                      this.props.setSelectedTtsLanguageScope
                    }
                  />
                </Route>

                {/* OLD TTS PAGE */}
                {/* <Route path="/tts" exact={true}>
                    <TtsModelListPage
                      sessionWrapper={this.props.sessionWrapper}
                      sessionSubscriptionsWrapper={
                        this.props.sessionSubscriptionsWrapper
                      }
                      isShowingVocodesNotice={this.props.isShowingVocodesNotice}
                      clearVocodesNotice={this.props.clearVocodesNotice}
                      isShowingLanguageNotice={
                        this.props.isShowingLangaugeNotice
                      }
                      clearLanguageNotice={this.props.clearLanguageNotice}
                      displayLanguage={this.props.displayLanguage}
                      isShowingTwitchTtsNotice={
                        this.props.isShowingTwitchTtsNotice
                      }
                      clearTwitchTtsNotice={this.props.clearTwitchTtsNotice}
                      isShowingPleaseFollowNotice={
                        this.props.isShowingPleaseFollowNotice
                      }
                      clearPleaseFollowNotice={
                        this.props.clearPleaseFollowNotice
                      }
                      isShowingBootstrapLanguageNotice={
                        this.props.isShowingBootstrapLanguageNotice
                      }
                      clearBootstrapLanguageNotice={
                        this.props.clearBootstrapLanguageNotice
                      }
                      textBuffer={this.props.textBuffer}
                      setTextBuffer={this.props.setTextBuffer}
                      clearTextBuffer={this.props.clearTextBuffer}
                      ttsModels={this.props.ttsModels}
                      setTtsModels={this.props.setTtsModels}
                      allTtsCategories={this.props.allTtsCategories}
                      setAllTtsCategories={this.props.setAllTtsCategories}
                      allTtsCategoriesByTokenMap={
                        this.props.allTtsCategoriesByTokenMap
                      }
                      computedTtsCategoryAssignments={
                        this.props.computedTtsCategoryAssignments
                      }
                      setComputedTtsCategoryAssignments={
                        this.props.setComputedTtsCategoryAssignments
                      }
                      allTtsModelsByTokenMap={this.props.allTtsModelsByTokenMap}
                      ttsModelsByCategoryToken={
                        this.props.ttsModelsByCategoryToken
                      }
                      dropdownCategories={this.props.dropdownCategories}
                      setDropdownCategories={this.props.setDropdownCategories}
                      selectedCategories={this.props.selectedCategories}
                      setSelectedCategories={this.props.setSelectedCategories}
                      maybeSelectedTtsModel={this.props.maybeSelectedTtsModel}
                      setMaybeSelectedTtsModel={
                        this.props.setMaybeSelectedTtsModel
                      }
                      selectedTtsLanguageScope={
                        this.props.selectedTtsLanguageScope
                      }
                      setSelectedTtsLanguageScope={
                        this.props.setSelectedTtsLanguageScope
                      }
                    />
                  </Route> */}

                <Route path="/studio-mobile-check">
                  <StudioMobileCheckPage />
                </Route>

                <Route path="/category/create">
                  <CreateCategoryPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/creator-onboarding">
                  <CreatorTypeformPage />
                </Route>

                <Route path="/welcome">
                  <SignUpSuccessPage />
                </Route>

                <Route path="/beta-key/create">
                  <CreateBetaKeyPage />
                </Route>

                <Route path="/beta-key/redeem/success">
                  <RedeemSuccessPage />
                </Route>

                <Route path="/beta-key/redeem/:token?">
                  <RedeemBetaKeyPage />
                </Route>

                <Route path="/beta-key/list">
                  <BetaKeysListPage />
                </Route>

                <Route path="/tools">
                  <CreatorToolsPage
                    sessionWrapper={this.props.sessionWrapper}
                  />
                </Route>

                <Route path="/waitlist-next-steps">
                  <WaitlistNextStepsPage />
                </Route>

                {/* <Route path="/ai-live-portrait">
                    <AIFaceMirror
                      {...{
                        sessionSubscriptionsWrapper:
                          this.props.sessionSubscriptionsWrapper,
                      }}
                    />
                  </Route> */}

                {/*
                  // <Route path="/engine-compositor">
                  //   <EngineCompositor
                  //     sessionWrapper={this.props.sessionWrapper}
                  //   />
                  // </Route>
                    */}

                <Route path="/" exact={true}>
                  <LandingPage
                    sessionWrapper={this.props.sessionWrapper}
                    sessionSubscriptionsWrapper={
                      this.props.sessionSubscriptionsWrapper
                    }
                  />
                </Route>
              </Switch>
            </div>
          </div>
        </SearchProvider>
      </DomainConfigProvider>
    );
  }
}

export default withRouter(PageContainer);
