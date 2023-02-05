import React from "react";
import { AboutPage } from "./pages/about/about_page/AboutPage";
import { GuidePage } from "./pages/about/guide_page/GuidePage";
import { FirehoseEventListPage } from "./pages/firehose/FirehoseEventListPage";
import { LoginPage } from "./pages/login/LoginPage";
import { ModerationFc } from "./pages/moderation/moderation_main/ModerationFc";
import { ModerationIpBanListFc } from "./pages/moderation/moderation_ip_ban_list/ModerationIpBanListFc";
import { ModerationViewIpBanFc } from "./pages/moderation/moderation_view_ip_ban/ModerationViewIpBanFc";
import { FooterNav } from "./nav/FooterNav";
import { TopNav } from "./nav/TopNav";
import { ProfileEditFc } from "./pages/profile/profile_edit/ProfileEditFc";
import { ProfilePage } from "./pages/profile/profile_view/ProfilePage";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { SignupPage } from "./pages/signup/SignupPage";
import { Switch, Route } from "react-router-dom";
import { TermsPage } from "./pages/about/terms_page/TermsPage";
import { TtsInferenceJob, W2lInferenceJob } from "../../App";
import { TtsModelDeletePage } from "./pages/tts/tts_model_delete/TtsModelDeletePage";
import { TtsModelEditPage } from "./pages/tts/tts_model_edit/TtsModelEditPage";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { VocoderUploadJob } from "@storyteller/components/src/jobs/VocoderUploadJobs";
import { TtsModelViewPage } from "./pages/tts/tts_model_view/TtsModelViewPage";
import { TtsResultDeletePage } from "./pages/tts/tts_result_delete/TtsResultDeletePage";
import { TtsResultViewPage } from "./pages/tts/tts_result_view/TtsResultViewPage";
import { ContributeIndexPage } from "./pages/contribute/ContributeIndexPage";
import { UploadTtsModelPage } from "./pages/upload/UploadTtsModelPage";
import { UploadW2lPhotoPage } from "./pages/upload/UploadW2lPhotoPage";
import { UploadW2lVideoPage } from "./pages/upload/UploadW2lVideoPage";
import { W2lResultViewPage } from "./pages/w2l/w2l_result_view/W2lResultViewPage";
import { W2lTemplateListPage } from "./pages/w2l/w2l_template_list/W2lTemplateListPage";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { W2lTemplateViewPage } from "./pages/w2l/w2l_template_view/W2lTemplateViewPage";
import { TtsResultEditPage } from "./pages/tts/tts_result_edit/TtsResultEditPage";
import { W2lResultEditPage } from "./pages/w2l/w2l_result_edit/W2lResultEditPage";
import { W2lTemplateDeletePage } from "./pages/w2l/w2l_template_delete/W2lTemplateDeletePage";
import { W2lTemplateEditPage } from "./pages/w2l/w2l_template_edit/W2lTemplateEditPage";
import { W2lResultDeletePage } from "./pages/w2l/w2l_result_delete/W2lResultDeletePage";
import { W2lTemplateApprovePage } from "./pages/w2l/w2l_template_approve/W2lTemplateApprovePage";
import { TtsModelListPage } from "./pages/tts/tts_model_list/TtsModelListPage";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { ProfileBanFc } from "./pages/profile/profile_ban/ProfileBanFc";
import { ModerationUserListFc } from "./pages/moderation/moderation_user_list/ModerationUserList";
import { LeaderboardPage } from "./pages/leaderboard/LeaderboardPage";
import { ModerationJobStatsFc } from "./pages/moderation/moderation_job_stats/ModerationJobStatsFc";
import { ModerationPendingW2lTemplatesFc } from "./pages/moderation/moderation_pending_w2l_templates/ModerationPendingW2lTemplatesFc";
import { ModerationVoiceStatsFc } from "./pages/moderation/moderation_voice_stats/ModerationVoiceStatsFc";
import { CreateCategoryPage } from "./pages/category/CreateCategoryPage";
import { TtsEditCategoriesPage } from "./pages/tts/tts_edit_categories/TtsEditCategoriesPage";
import { ModerationTtsCategoryListPage } from "./pages/moderation/categories/ModerationTtsCategoryListPage";
import { ModerationTtsCategoryEditPage } from "./pages/moderation/categories/ModerationTtsCategoryEditPage";
import { ModerationCategoryDeletePage } from "./pages/moderation/categories/ModerationCategoryDeletePage";
import { TtsCategoryType } from "../../AppWrapper";
import { PatronPage } from "./pages/patrons/PatronPage";
import ScrollToTop from "./_common/ScrollToTop";
import { Language } from "@storyteller/components/src/i18n/Language";
import { VoiceCloneRequestPage } from "./pages/clone_voice_requests/VoiceCloneRequestPage";
import { VocodesPage } from "./pages/vocodes/VocodesPage";
import { UploadVocoderPage } from "./pages/upload/UploadVocoderPage";
import { PricingPage } from "./pages/premium/PricingPage";
import { CheckoutSuccessPage } from "./pages/premium/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./pages/premium/CheckoutCancelPage";
import { PortalSuccessPage } from "./pages/premium/PortalSuccessPage";
import { PrivacyPage } from "./pages/about/privacy_page/PrivacyPage";
import { GetComputedTtsCategoryAssignmentsSuccessResponse } from "@storyteller/components/src/api/category/GetComputedTtsCategoryAssignments";
import { ChannelsPage } from "./pages/channels/ChannelsPage";
import { LandingPage } from "./pages/landing/LandingPage";
//import { LandingPage } from "./pages/landing/LandingPage";
//import { VcModelListPage } from "./pages/vc/vc_model_list/VcModelListPage";

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

  enqueueTtsJob: (jobToken: string) => void;
  ttsInferenceJobs: Array<TtsInferenceJob>;

  enqueueW2lJob: (jobToken: string) => void;
  w2lInferenceJobs: Array<W2lInferenceJob>;

  enqueueTtsModelUploadJob: (jobToken: string) => void;
  ttsModelUploadJobs: Array<TtsModelUploadJob>;

  enqueueW2lTemplateUploadJob: (jobToken: string) => void;
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>;

  enqueueVocoderUploadJob: (jobToken: string) => void;
  vocoderUploadJobs: Array<VocoderUploadJob>;

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
}

interface State {}

class PageContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  logout = () => {};

  public render() {
    return (
      <div id="main" className="mainwrap">
        <div id="viewable">
          <TopNav
            logoutHandler={this.logout}
            sessionWrapper={this.props.sessionWrapper}
            querySessionCallback={this.props.querySessionAction}
            querySessionSubscriptionsCallback={
              this.props.querySessionSubscriptionsAction
            }
          />

          <ScrollToTop />

          <Switch>
            <Route path="/firehose">
              <FirehoseEventListPage
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/channels">
              <ChannelsPage sessionWrapper={this.props.sessionWrapper} />
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

            <Route path="/profile/:username/edit">
              <ProfileEditFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/profile/:username/ban">
              <ProfileBanFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/profile/:username">
              <ProfilePage
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

            <Route path="/tts/result/:token/edit">
              <TtsResultEditPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/tts/result/:token/delete">
              <TtsResultDeletePage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/tts/result/:token">
              <TtsResultViewPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/tts/:token/edit">
              <TtsModelEditPage
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
              />
            </Route>

            <Route path="/tts/:token/delete">
              <TtsModelDeletePage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/tts/:token/categories">
              <TtsEditCategoriesPage
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/:token">
              <TtsModelViewPage
                sessionWrapper={this.props.sessionWrapper}
                sessionSubscriptionsWrapper={
                  this.props.sessionSubscriptionsWrapper
                }
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
                textBuffer={this.props.textBuffer}
                setTextBuffer={this.props.setTextBuffer}
                clearTextBuffer={this.props.clearTextBuffer}
              />
            </Route>

            <Route path="/w2l/result/:token/edit">
              <W2lResultEditPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/result/:token/delete">
              <W2lResultDeletePage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/result/:token">
              <W2lResultViewPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/:templateToken/edit">
              <W2lTemplateEditPage sessionWrapper={this.props.sessionWrapper} />
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

            <Route path="/w2l/:templateSlug">
              <W2lTemplateViewPage
                sessionWrapper={this.props.sessionWrapper}
                enqueueW2lJob={this.props.enqueueW2lJob}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
              />
            </Route>

            <Route path="/video">
              <W2lTemplateListPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/upload/w2l_photo">
              <UploadW2lPhotoPage
                sessionWrapper={this.props.sessionWrapper}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={
                  this.props.enqueueW2lTemplateUploadJob
                }
              />
            </Route>

            <Route path="/upload/w2l_video">
              <UploadW2lVideoPage
                sessionWrapper={this.props.sessionWrapper}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={
                  this.props.enqueueW2lTemplateUploadJob
                }
              />
            </Route>

            <Route path="/upload/tts">
              <UploadTtsModelPage
                sessionWrapper={this.props.sessionWrapper}
                ttsModelUploadJobs={this.props.ttsModelUploadJobs}
                enqueueTtsModelUploadJob={this.props.enqueueTtsModelUploadJob}
              />
            </Route>

            <Route path="/upload/vocoder" exact={true}>
              <UploadVocoderPage
                sessionWrapper={this.props.sessionWrapper}
                vocoderUploadJobs={this.props.vocoderUploadJobs}
                enqueueVocoderUploadJob={this.props.enqueueVocoderUploadJob}
              />
            </Route>

            <Route path="/contribute">
              <ContributeIndexPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/category/create">
              <CreateCategoryPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/moderation/user/list">
              <ModerationUserListFc
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
              <ModerationFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route exact={true} path="/clone">
              <VoiceCloneRequestPage />
            </Route>

            <Route path="/patrons">
              <PatronPage sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/landing_temp">
              <LandingPage 
                sessionWrapper={this.props.sessionWrapper} 
                sessionSubscriptionsWrapper={
                  this.props.sessionSubscriptionsWrapper
                }
              />
            </Route>

            <Route path="/about">
              <AboutPage />
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

            <Route path="/">
              <TtsModelListPage
                sessionWrapper={this.props.sessionWrapper}
                sessionSubscriptionsWrapper={
                  this.props.sessionSubscriptionsWrapper
                }
                isShowingVocodesNotice={this.props.isShowingVocodesNotice}
                clearVocodesNotice={this.props.clearVocodesNotice}
                isShowingLanguageNotice={this.props.isShowingLangaugeNotice}
                clearLanguageNotice={this.props.clearLanguageNotice}
                displayLanguage={this.props.displayLanguage}
                isShowingTwitchTtsNotice={this.props.isShowingTwitchTtsNotice}
                clearTwitchTtsNotice={this.props.clearTwitchTtsNotice}
                isShowingPleaseFollowNotice={
                  this.props.isShowingPleaseFollowNotice
                }
                clearPleaseFollowNotice={this.props.clearPleaseFollowNotice}
                isShowingBootstrapLanguageNotice={
                  this.props.isShowingBootstrapLanguageNotice
                }
                clearBootstrapLanguageNotice={
                  this.props.clearBootstrapLanguageNotice
                }
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
                ttsModelUploadJobs={this.props.ttsModelUploadJobs}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
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
                ttsModelsByCategoryToken={this.props.ttsModelsByCategoryToken}
                dropdownCategories={this.props.dropdownCategories}
                setDropdownCategories={this.props.setDropdownCategories}
                selectedCategories={this.props.selectedCategories}
                setSelectedCategories={this.props.setSelectedCategories}
                maybeSelectedTtsModel={this.props.maybeSelectedTtsModel}
                setMaybeSelectedTtsModel={this.props.setMaybeSelectedTtsModel}
                selectedTtsLanguageScope={this.props.selectedTtsLanguageScope}
                setSelectedTtsLanguageScope={
                  this.props.setSelectedTtsLanguageScope
                }
              />
            </Route>

            {/* TODO(bt, 2023-01-11): Not ready to launch voice conversion yet
            <Route path="/voice-conversion">
              <VcModelListPage
                sessionWrapper={this.props.sessionWrapper}
                sessionSubscriptionsWrapper={
                  this.props.sessionSubscriptionsWrapper
                }
              />
            </Route>
              */}

            {/* TODO(bt, 2023-01-11): Not ready to launch voice conversion yet
            <Route path="/">
              <LandingPage
                sessionWrapper={this.props.sessionWrapper}
                sessionSubscriptionsWrapper={
                  this.props.sessionSubscriptionsWrapper
                }
              />
            </Route>
              */}
          </Switch>

          <FooterNav sessionWrapper={this.props.sessionWrapper} />
        </div>
      </div>
    );
  }
}

export { PageContainer };
