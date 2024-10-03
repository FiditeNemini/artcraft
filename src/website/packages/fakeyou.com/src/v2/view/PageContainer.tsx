import React, { lazy, Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import ProfileSidePanel from "components/layout/ProfileSidePanel/ProfileSidePanel";
import TopNav from "components/layout/TopNav/TopNav";
import ScrollToTop from "./_common/ScrollToTop";
import { Spinner } from "components/common";

const routes = [
  {
    path: "/",
    component: import("./pages/landing/LandingPage"),
    exact: true,
  },
  {
    path: "/about",
    component: import("./pages/about/about_page/AboutPage"),
  },
  {
    path: "/firehose",
    component: import("./pages/firehose/FirehoseEventListPage"),
  },
  {
    path: "/news",
    component: import("./pages/news/NewsPage"),
  },
  {
    path: "/leaderboard",
    component: import("./pages/leaderboard/LeaderboardPage"),
  },
  {
    path: "/login",
    component: import("./pages/login/LoginPage"),
  },
  {
    path: "/password-reset/verify",
    component: import("./pages/password_reset/PasswordResetVerificationPage"),
  },
  {
    path: "/password-reset",
    component: import("./pages/password_reset/PasswordResetEmailPage"),
  },
  {
    path: "/profile/:username/edit", // verify
    component: import("./pages/profile/profile_edit/ProfileEditFc"),
  },
  {
    path: "/profile/:username/ban", // verify
    component: import("./pages/profile/profile_ban/ProfileBanFc"),
  },
  {
    path: "/profile/:username", // verify
    component: import("./pages/profile/profile_view/ProfilePageV3"),
  },
  {
    path: "/signup",
    component: import("./pages/signup/SignupPage"),
  },
  {
    path: "/set-username",
    component: import("./pages/signup/SetUsernameModal"),
  },
  {
    path: "/pricing",
    component: import("./pages/premium/PricingPage"),
  },
  {
    path: "/checkout_success",
    component: import("./pages/premium/CheckoutSuccessPage"),
  },
  {
    path: "/checkout_cancel",
    component: import("./pages/premium/CheckoutCancelPage"),
  },
  {
    path: "/portal_success",
    component: import("./pages/premium/PortalSuccessPage"),
  },
  {
    path: "/media/rename/:media_file_token",
    component: import("./pages/media/MediaRenamePage"),
  },
  {
    path: "/media/:token",
    component: import("./pages/media/MediaPageSwitch"),
  },
  {
    path: "/edit-cover-image/:token",
    component: import("./pages/media/EditCoverImage"),
  },
  {
    path: "/explore",
    component: import("./pages/explore/ExplorePage"),
  },
  {
    path: "/weight/:weight_token/edit",
    component: import("./pages/weight/WeightEditPage"),
  },
  {
    path: "/weight/:weight_token/:maybe_url_slug?",
    component: import("./pages/weight/WeightPage"),
  },
  {
    path: "/search/weights",
    component: import("./pages/search/SearchPage"),
  },
  {
    path: "/tts/result/:token/edit",
    component: import("./pages/tts/tts_result_edit/TtsResultEditPage"),
  },
  {
    path: "/tts/result/:token/delete",
    component: import("./pages/tts/tts_result_delete/TtsResultDeletePage"),
  },
  {
    path: "/tts/result/:token",
    component: import("./pages/tts/tts_result_view/TtsResultViewPage"),
  },
  {
    path: "/tts/:token/edit",
    component: import("./pages/tts/tts_model_edit/TtsModelEditPage"),
  },
  {
    path: "/tts/:token/delete",
    component: import("./pages/tts/tts_model_delete/TtsModelDeletePage"),
  },
  {
    path: "/tts/:token/categories",
    component: import("./pages/tts/tts_edit_categories/TtsEditCategoriesPage"),
  },
  {
    path: "/tts/:token",
    component: import("./pages/tts/tts_model_view/TtsModelViewPage"),
  },
  {
    path: "/w2l/result/:token/edit",
    component: import("./pages/w2l/w2l_result_edit/W2lResultEditPage"),
  },
  {
    path: "/w2l/result/:token/delete",
    component: import("./pages/w2l/w2l_result_delete/W2lResultDeletePage"),
  },
  {
    path: "/w2l/result/:token",
    component: import("./pages/w2l/w2l_result_view/W2lResultViewPage"),
  },
  {
    path: "/w2l/:templateToken/edit",
    component: import("./pages/w2l/w2l_template_edit/W2lTemplateEditPage"),
  },
  {
    path: "/w2l/:templateToken/approval",
    component: import(
      "./pages/w2l/w2l_template_approve/W2lTemplateApprovePage"
    ),
  },
  {
    path: "/w2l/:templateToken/delete",
    component: import("./pages/w2l/w2l_template_delete/W2lTemplateDeletePage"),
  },
  {
    path: "/video",
    component: import("./pages/w2l/w2l_template_list/W2lTemplateListPage"),
  },
  {
    path: "/upload/tts",
    component: import("./pages/upload/UploadTtsModelPage"),
  },
  {
    path: "/upload/tts_model",
    component: import("./pages/upload/UploadNewTtsModelPage"),
  },
  {
    path: "/upload/sd",
    component: import("./pages/upload/UploadSdWeightPage"),
  },
  {
    path: "/upload/lora",
    component: import("./pages/upload/UploadLoraWeightPage"),
  },
  {
    path: "/upload/workflow",
    component: import("./pages/upload/UploadWorkflowPage"),
  },
  {
    path: "/contribute",
    component: import("./pages/contribute/ContributeIndexPage"),
  },
  {
    path: "/moderation/user/list",
    component: import(
      "./pages/moderation/moderation_user_list/ModerationUserList"
    ),
  },
  {
    path: "/moderation/user_feature_flags/:username?",
    component: import(
      "./pages/moderation/moderation_user_feature_flags/ModerationUserFeatureFlagsPage"
    ),
  },
  {
    path: "/moderation/ip_bans/:ipAddress",
    component: import(
      "./pages/moderation/moderation_view_ip_ban/ModerationViewIpBanFc"
    ),
  },
  {
    path: "/moderation/ip_bans",
    component: import(
      "./pages/moderation/moderation_ip_ban_list/ModerationIpBanListFc"
    ),
  },
  {
    path: "/moderation/voice_stats",
    component: import(
      "./pages/moderation/moderation_voice_stats/ModerationVoiceStatsFc"
    ),
  },
  {
    path: "/moderation/job_stats",
    component: import(
      "./pages/moderation/moderation_job_stats/ModerationJobStatsFc"
    ),
  },
  {
    path: "/moderation/job_control",
    component: import(
      "./pages/moderation/job_control/ModerationJobControlPage"
    ),
  },
  {
    path: "/moderation/token_info",
    component: import("./pages/moderation/ModerationTokenInfoPage"),
  },
  {
    path: "/moderation/tts_category/list",
    component: import(
      "./pages/moderation/categories/ModerationTtsCategoryListPage"
    ),
  },
  {
    path: "/moderation/tts_category/edit/:token",
    component: import(
      "./pages/moderation/categories/ModerationTtsCategoryEditPage"
    ),
  },
  {
    path: "/moderation/category/delete/:token",
    component: import(
      "./pages/moderation/categories/ModerationCategoryDeletePage"
    ),
  },
  {
    path: "/moderation/approve/w2l_templates",
    component: import(
      "./pages/moderation/moderation_pending_w2l_templates/ModerationPendingW2lTemplatesFc"
    ),
  },
  {
    path: "/moderation",
    component: import("./pages/moderation/moderation_main/ModerationPage"),
  },
  {
    path: "/clone",
    component: import("./pages/clone_voice_requests/VoiceCloneRequestPage"),
  },
  {
    path: "/patrons",
    component: import("./pages/patrons/PatronPage"),
  },
  {
    path: "/product-usage",
    component: import("./pages/product_usage_info/ProductUsageInfoPage"),
  },
  {
    path: "/voice-conversion/:token/delete",
    component: import("./pages/vc/vc_model_delete/VcModelDeletePage"),
  },
  {
    path: "/voice-conversion/:token/edit",
    component: import("./pages/vc/vc_model_edit/VcModelEditPage"),
  },
  {
    path: "/voice-conversion/:token",
    component: import("./pages/vc/vc_model_view/VcModelViewPage"),
  },
  {
    path: "/dashboard",
    component: import("./pages/dashboard/DashboardPage"),
  },
  {
    path: "/face-animator/:mediaToken?",
    component: import("./pages/face_animator"),
  },
  {
    path: "/fbx-to-gltf/:mediaToken?",
    component: import("./pages/fbx_to_gltf/FbxToGltfPage"),
  },
  {
    path: "/commissions",
    component: import("./pages/contest/CommunityCommissionsPage"),
  },
  {
    path: "/guide",
    component: import("./pages/about/guide_page/GuidePage"),
  },
  {
    path: "/old",
    component: import("./pages/vocodes/VocodesPage"),
  },
  {
    path: "/dev-upload",
    component: import("./pages/dev_upload/DevUpload"),
  },
  {
    path: "/dev-upload-alt",
    component: import("./pages/dev_upload/DevUploadAlt"),
  },
  {
    path: "/dev-media-input",
    component: import("./pages/dev_upload/DevMediaInput"),
  },
  {
    path: "/tts",
    component: import("./pages/audio_gen/tts/NewTTS"),
  },
  {
    path: "/voice-conversion",
    component: import("./pages/audio_gen/vc/NewVC"),
  },
  {
    path: "/ai-live-portrait",
    component: import("./pages/live_portrait/LivePortrait"),
  },
  {
    path: "/ai-lip-sync",
    component: import("./pages/lipsync/Lipsync"),
  },
  {
    path: "/webcam-acting",
    component: import("./pages/live_portrait/CameraLivePortrait"),
  },
  {
    path: "/voice-designer/create",
    component: import("./pages/voice_designer/VoiceDesignerFormPage"),
    exact: true,
  },
  {
    path: "/voice-designer/dataset/:dataset_token/edit",
    component: import("./pages/voice_designer/VoiceDesignerFormPage"),
    exact: true,
  },
  {
    path: "/voice-designer/dataset/:dataset_token/upload",
    component: import("./pages/voice_designer/VoiceDesignerFormPage"),
    exact: true,
  },
  {
    path: "/voice-designer/voice/:voice_token/edit",
    component: import("./pages/voice_designer/VoiceDesignerVoiceEditPage"),
  },
  {
    path: "/voice-designer/voice/:voice_token",
    component: import("./pages/voice_designer/VoiceDesignerUseVoicePage"),
  },
  {
    path: "/inference-jobs-list",
    component: import("./pages/inference_jobs_page/InferenceJobsPage"),
  },
  {
    path: "/voice-designer",
    component: import("./pages/voice_designer/VoiceDesignerMainPage"),
  },
  {
    path: "/style-video/:mediaToken?",
    component: import("./pages/style-video"),
  },
  {
    path: "/video-mocap/:mediaToken?",
    component: import("./pages/video_mocap"),
  },
  {
    path: "/text-to-image",
    component: import("./pages/text_to_image/TextToImagePage"),
  },
  {
    path: "/character/donald-trump",
    component: import("./pages/audio_gen/tts/NewTrumpTTS"),
  },
  {
    path: "/beta/3d-video-compositor/form",
    component: import("./pages/beta_products/Beta3DVideoCompositorForm"),
  },
  {
    path: "/beta/3d-video-compositor",
    component: import("./pages/beta_products/Beta3DVideoCompositorPage"),
  },
  {
    path: "/beta/2d-video-compositor/form",
    component: import("./pages/beta_products/BetaVideoCompositorForm"),
  },
  {
    path: "/beta/2d-video-compositor",
    component: import("./pages/beta_products/BetaVideoCompositorPage"),
  },
  {
    path: "/beta/lip-sync/form",
    component: import("./pages/beta_products/BetaLipSyncForm"),
  },
  {
    path: "/beta/lip-sync",
    component: import("./pages/beta_products/BetaLipSyncPage"),
  },
  {
    path: "/studio-mobile-check",
    component: import(
      "./pages/landing/storyteller/PostlaunchLanding/StudioMobileCheckPage"
    ),
  },
  {
    path: "/category/create",
    component: import("./pages/category/CreateCategoryPage"),
  },
  {
    path: "/creator-onboarding",
    component: import(
      "./pages/landing/storyteller/PostlaunchLanding/CreatorTypeformPage"
    ),
  },
  {
    path: "/welcome",
    component: import("./pages/beta_key/SignUpSuccessPage"),
  },
  {
    path: "/beta-key/create",
    component: import("./pages/beta_key/CreateBetaKeyPage"),
  },
  {
    path: "/beta-key/redeem/success",
    component: import("./pages/beta_key/RedeemSuccessPage"),
  },
  {
    path: "/beta-key/redeem/:token?",
    component: import("./pages/beta_key/RedeemBetaKeyPage"),
  },
  {
    path: "/beta-key/list",
    component: import("./pages/beta_key/BetaKeysListPage"),
  },
  {
    path: "/dev/tools",
    component: import("./pages/tools_test/ToolsTestPage"),
  },
  {
    path: "/tools",
    component: import("./pages/creator_tools/CreatorToolsPage"),
  },
  {
    path: "/waitlist-next-steps",
    component: import("./pages/waitlist_next_steps/WaitlistNextStepsPage"),
  },
].map(({ path, component, exact }, key) => {
  const PageComponent = lazy(() => component);
  return (
    <Route {...{ key, path, exact }}>
      <Suspense {...{ fallback: Spinner }}>
        <PageComponent />
      </Suspense>
    </Route>
  );
});

export default function PageContainer() {
  return (
    <>
      <ScrollToTop />
      <div id="wrapper" className="no-padding">
        <TopNav />

        <ProfileSidePanel />
        <Switch>{routes}</Switch>
      </div>
    </>
  );
}
