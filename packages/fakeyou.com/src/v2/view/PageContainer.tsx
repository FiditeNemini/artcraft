import React from "react";
import { AboutPage } from "./about/about_page/AboutPage";
import { GuidePage } from "./about/guide_page/GuidePage";
import { FirehoseEventListFc } from "./firehose/FirehoseEventListFc";
import { LoginPage } from "./login/LoginPage";
import { ModerationFc } from "./moderation/moderation_main/ModerationFc";
import { ModerationIpBanListFc } from "./moderation/moderation_ip_ban_list/ModerationIpBanListFc";
import { ModerationViewIpBanFc } from "./moderation/moderation_view_ip_ban/ModerationViewIpBanFc";
import { FooterNav } from "../nav/FooterNav";
import { TopNav } from "../nav/TopNav";
import { ProfileEditFc } from "./profile/profile_edit/ProfileEditFc";
import { ProfilePage } from "./profile/profile_view/ProfilePage";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { SignupPage } from "./signup/SignupPage";
import { Switch, Route } from "react-router-dom";
import { TermsPage } from "./about/terms_page/TermsPage";
import { TtsInferenceJob, W2lInferenceJob } from "../../App";
import { TtsModelDeletePage } from "./tts/tts_model_delete/TtsModelDeletePage";
import { TtsModelEditPage } from "./tts/tts_model_edit/TtsModelEditPage";
import { TtsModelUploadJob } from "@storyteller/components/src/jobs/TtsModelUploadJobs";
import { VocoderUploadJob } from "@storyteller/components/src/jobs/VocoderUploadJobs";
import { TtsModelViewPage } from "./tts/tts_model_view/TtsModelViewPage";
import { TtsResultDeletePage } from "./tts/tts_result_delete/TtsResultDeletePage";
import { TtsResultViewPage } from "./tts/tts_result_view/TtsResultViewPage";
import { ContributeIndexPage } from "./contribute/ContributeIndexPage";
import { UploadTtsModelPage } from "./upload/UploadTtsModelPage";
import { UploadW2lPhotoPage } from "./upload/UploadW2lPhotoPage";
import { UploadW2lVideoPage } from "./upload/UploadW2lVideoPage";
import { W2lResultViewFc } from "./w2l/w2l_result_view/W2lResultViewFc";
import { W2lTemplateListFc } from "./w2l/w2l_template_list/W2lTemplateListFc";
import { W2lTemplateUploadJob } from "@storyteller/components/src/jobs/W2lTemplateUploadJobs";
import { W2lTemplateViewFc } from "./w2l/w2l_template_view/W2lTemplateViewFc";
import { TtsResultEditPage } from "./tts/tts_result_edit/TtsResultEditPage";
import { W2lResultEditFc } from "./w2l/w2l_result_edit/W2lResultEditFc";
import { W2lTemplateDeleteFc } from "./w2l/w2l_template_delete/W2lTemplateDeleteFc";
import { W2lTemplateEditFc } from "./w2l/w2l_template_edit/W2lTemplateEditFc";
import { W2lResultDeleteFc } from "./w2l/w2l_result_delete/W2lResultDeleteFc";
import { W2lTemplateApproveFc } from "./w2l/w2l_template_approve/W2lTemplateApproveFc";
import { TtsModelListPage } from "./tts/tts_model_list/TtsModelListPage";
import { TtsModelListItem } from "@storyteller/components/src/api/tts/ListTtsModels";
import { ProfileBanFc } from "./profile/profile_ban/ProfileBanFc";
import { ModerationUserListFc } from "./moderation/moderation_user_list/ModerationUserList";
import { LeaderboardFc } from "./leaderboard/LeaderboardFc";
import { ModerationJobStatsFc } from "./moderation/moderation_job_stats/ModerationJobStatsFc";
import { ModerationPendingW2lTemplatesFc } from "./moderation/moderation_pending_w2l_templates/ModerationPendingW2lTemplatesFc";
import { ModerationVoiceStatsFc } from "./moderation/moderation_voice_stats/ModerationVoiceStatsFc";
import { CreateCategoryPage } from "./category/CreateCategoryPage";
import { TtsEditCategoriesPage } from "./tts/tts_edit_categories/TtsEditCategoriesPage";
import { ModerationTtsCategoryListPage } from "./moderation/categories/ModerationTtsCategoryListPage";
import { ModerationTtsCategoryEditPage } from "./moderation/categories/ModerationTtsCategoryEditPage";
import { ModerationCategoryDeletePage } from "./moderation/categories/ModerationCategoryDeletePage";
import { TtsCategoryType } from "../../AppWrapper";
import { PatronPage } from "./patrons/PatronPage";
import ScrollToTop from "./_common/ScrollToTop";
import { Language } from "@storyteller/components/src/i18n/Language";
import { VoiceCloneRequestPage } from "./clone_voice_requests/VoiceCloneRequestPage";
import { VocodesPage } from "./vocodes/VocodesPage";
import { UploadVocoderPage } from "./upload/UploadVocoderPage";
import { PricingPage } from "./premium/PricingPage";
import { CheckoutSuccessPage } from "./premium/CheckoutSuccessPage";
import { CheckoutCancelPage } from "./premium/CheckoutCancelPage";
import { PortalSuccessPage } from "./premium/PortalSuccessPage";
import { PrivacyPage } from "./about/privacy_page/PrivacyPage";
import { GetComputedTtsCategoryAssignmentsSuccessResponse } from "../api/category/GetComputedTtsCategoryAssignments";
//import { LandingPage } from "./landing/LandingPage";
//import { VcModelListPage } from "./vc/vc_model_list/VcModelListPage";

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
  setComputedTtsCategoryAssignments: (categoryAssignments: GetComputedTtsCategoryAssignmentsSuccessResponse) => void;

  allTtsCategoriesByTokenMap: Map<string, TtsCategoryType>;
  allTtsModelsByTokenMap: Map<string, TtsModelListItem>;
  ttsModelsByCategoryToken: Map<string, Set<TtsModelListItem>>;

  dropdownCategories: TtsCategoryType[][];
  setDropdownCategories: (dropdownCategories: TtsCategoryType[][]) => void;
  selectedCategories: TtsCategoryType[];
  setSelectedCategories: (selectedCategories: TtsCategoryType[]) => void;

  maybeSelectedTtsModel?: TtsModelListItem;
  setMaybeSelectedTtsModel: (maybeSelectedTtsModel: TtsModelListItem) => void;
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
              <FirehoseEventListFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/leaderboard">
              <LeaderboardFc sessionWrapper={this.props.sessionWrapper} />
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
              <W2lResultEditFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/result/:token/delete">
              <W2lResultDeleteFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/result/:token">
              <W2lResultViewFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/:templateToken/edit">
              <W2lTemplateEditFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/:templateToken/approval">
              <W2lTemplateApproveFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateToken/delete">
              <W2lTemplateDeleteFc sessionWrapper={this.props.sessionWrapper} />
            </Route>

            <Route path="/w2l/:templateSlug">
              <W2lTemplateViewFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueW2lJob={this.props.enqueueW2lJob}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
              />
            </Route>

            <Route path="/video">
              <W2lTemplateListFc sessionWrapper={this.props.sessionWrapper} />
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
                computedTtsCategoryAssignments={this.props.computedTtsCategoryAssignments}
                setComputedTtsCategoryAssignments={this.props.setComputedTtsCategoryAssignments}
                allTtsModelsByTokenMap={this.props.allTtsModelsByTokenMap}
                ttsModelsByCategoryToken={this.props.ttsModelsByCategoryToken}
                dropdownCategories={this.props.dropdownCategories}
                setDropdownCategories={this.props.setDropdownCategories}
                selectedCategories={this.props.selectedCategories}
                setSelectedCategories={this.props.setSelectedCategories}
                maybeSelectedTtsModel={this.props.maybeSelectedTtsModel}
                setMaybeSelectedTtsModel={this.props.setMaybeSelectedTtsModel}
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
