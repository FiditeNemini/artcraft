import React from 'react';
import { AboutFc } from './about/about_page/AboutFc';
import { FirehoseEventListFc } from './firehose/FirehoseEventListFc';
import { LoginFc } from './login/LoginFc';
import { ModerationFc } from './moderation/moderation_main/ModerationFc';
import { ModerationIpBanListFc } from './moderation/moderation_ip_ban_list/ModerationIpBanListFc';
import { ModerationViewIpBanFc } from './moderation/moderation_view_ip_ban/ModerationViewIpBanFc';
import { NewFooterNavFc } from './NewFooterNavFc';
import { NewTopNavFc } from './NewTopNavFc';
import { ProfileEditFc } from './profile/profile_edit/ProfileEditFc';
import { ProfileFc } from './profile/profile_view/ProfileFc';
import { SessionWrapper } from '../../session/SessionWrapper';
import { SignupComponent } from './signup/SignupComponent';
import { Switch, Route } from 'react-router-dom';
import { TermsFc } from './about/terms_page/TermsFc';
import { TtsInferenceJob, W2lInferenceJob } from '../../App';
import { TtsModelDeleteFc } from './tts/tts_model_delete/TtsModelDeleteFc';
import { TtsModelEditFc } from './tts/tts_model_edit/TtsModelEditFc';
import { TtsModelUploadJob } from '../../jobs/TtsModelUploadJobs';
import { TtsModelViewFc } from './tts/tts_model_view/TtsModelViewFc';
import { TtsResultDeleteFc } from './tts/tts_result_delete/TtsResultDeleteFc';
import { TtsResultViewFc } from './tts/tts_result_view/TtsResultViewFc';
import { UploadChoiceFc } from './upload/UploadChoiceFc';
import { UploadTtsModelFc } from './upload/UploadTtsModelFc';
import { UploadW2lPhotoFc } from './upload/UploadW2lPhotoFc';
import { UploadW2lVideoFc } from './upload/UploadW2lVideoFc';
import { W2lResultViewFc } from './w2l/w2l_result_view/W2lResultViewFc';
import { W2lTemplateListFc } from './w2l/w2l_template_list/W2lTemplateListFc';
import { W2lTemplateUploadJob } from '../../jobs/W2lTemplateUploadJobs';
import { W2lTemplateViewFc } from './w2l/w2l_template_view/W2lTemplateViewFc';
import { TtsResultEditFc } from './tts/tts_result_edit/TtsResultEditFc';
import { W2lResultEditFc } from './w2l/w2l_result_edit/W2lResultEditFc';
import { W2lTemplateDeleteFc } from './w2l/w2l_template_delete/W2lTemplateDeleteFc';
import { W2lTemplateEditFc } from './w2l/w2l_template_edit/W2lTemplateEditFc';
import { W2lResultDeleteFc } from './w2l/w2l_result_delete/W2lResultDeleteFc';
import { W2lTemplateApproveFc } from './w2l/w2l_template_approve/W2lTemplateApproveFc';
import { TtsModelListFc } from './tts/tts_model_list/TtsModelListFc';
import { TtsModelListItem } from '../api/tts/ListTtsModels';
import { ProfileBanFc } from './profile/profile_ban/ProfileBanFc';

interface Props {
  sessionWrapper: SessionWrapper,
  querySessionAction: () => void,

  enqueueTtsJob: (jobToken: string) => void,
  ttsInferenceJobs: Array<TtsInferenceJob>,

  enqueueW2lJob: (jobToken: string) => void,
  w2lInferenceJobs: Array<W2lInferenceJob>,

  enqueueTtsModelUploadJob: (jobToken: string) => void,
  ttsModelUploadJobs: Array<TtsModelUploadJob>,

  enqueueW2lTemplateUploadJob: (jobToken: string) => void,
  w2lTemplateUploadJobs: Array<W2lTemplateUploadJob>,

  textBuffer: string,
  setTextBuffer: (textBuffer: string) => void,
  clearTextBuffer: () => void,

  ttsModels: Array<TtsModelListItem>,
  setTtsModels: (ttsVoices: Array<TtsModelListItem>) => void,
  currentTtsModelSelected?: TtsModelListItem,
  setCurrentTtsModelSelected: (ttsModel: TtsModelListItem) => void,
}

interface State {
}

class NewVocodesContainer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
    }
  }

  logout = () => {
  }

  public render() {
    return (
      <div id="main" className="mainwrap">
        <div id="viewable">

          <NewTopNavFc
            logoutHandler={this.logout}
            sessionWrapper={this.props.sessionWrapper}
            />

          <Switch>
            <Route path="/firehose">
              <FirehoseEventListFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/login">
              <LoginFc
                sessionWrapper={this.props.sessionWrapper}
                querySessionAction={this.props.querySessionAction}
              />
            </Route>


            <Route path="/profile/:username/edit">
                <ProfileEditFc
                  sessionWrapper={this.props.sessionWrapper}
                />
            </Route>

            <Route path="/profile/:username/ban">
              <ProfileBanFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/profile/:username">
                <ProfileFc
                  sessionWrapper={this.props.sessionWrapper}
                />
            </Route>

            <Route path="/signup">
              <SignupComponent
                querySessionCallback={()=>{}}
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/result/:token/edit">
              <TtsResultEditFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/result/:token/delete">
              <TtsResultDeleteFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/result/:token">
              <TtsResultViewFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/:token/edit">
              <TtsModelEditFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
              />
            </Route>

            <Route path="/tts/:token/delete">
              <TtsModelDeleteFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/tts/:token">
              <TtsModelViewFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueTtsJob={this.props.enqueueTtsJob}
                ttsInferenceJobs={this.props.ttsInferenceJobs}
                textBuffer={this.props.textBuffer}
                setTextBuffer={this.props.setTextBuffer}
                clearTextBuffer={this.props.clearTextBuffer}
              />
            </Route>

            <Route path="/w2l/result/:token/edit">
              <W2lResultEditFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/result/:token/delete">
              <W2lResultDeleteFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/result/:token">
              <W2lResultViewFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateToken/edit">
              <W2lTemplateEditFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateToken/approval">
              <W2lTemplateApproveFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateToken/delete">
              <W2lTemplateDeleteFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/w2l/:templateSlug">
              <W2lTemplateViewFc
                sessionWrapper={this.props.sessionWrapper}
                enqueueW2lJob={this.props.enqueueW2lJob}
                w2lInferenceJobs={this.props.w2lInferenceJobs}
              />
            </Route>

            <Route path="/video">
              <W2lTemplateListFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/upload/w2l_photo">
              <UploadW2lPhotoFc
                sessionWrapper={this.props.sessionWrapper}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={this.props.enqueueW2lTemplateUploadJob}
              />
            </Route>

            <Route path="/upload/w2l_video">
              <UploadW2lVideoFc
                sessionWrapper={this.props.sessionWrapper}
                w2lTemplateUploadJobs={this.props.w2lTemplateUploadJobs}
                enqueueW2lTemplateUploadJob={this.props.enqueueW2lTemplateUploadJob}
              />
            </Route>

            <Route path="/upload/tts">
              <UploadTtsModelFc
                sessionWrapper={this.props.sessionWrapper}
                ttsModelUploadJobs={this.props.ttsModelUploadJobs}
                enqueueTtsModelUploadJob={this.props.enqueueTtsModelUploadJob}
              />
            </Route>

            <Route path="/upload">
              <UploadChoiceFc
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

            <Route path="/moderation">
              <ModerationFc
                sessionWrapper={this.props.sessionWrapper}
              />
            </Route>

            <Route path="/about">
              <AboutFc />
            </Route>

            <Route path="/terms">
              <TermsFc />
            </Route>

            <Route path="/">
              <TtsModelListFc
                sessionWrapper={this.props.sessionWrapper}
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
                currentTtsModelSelected={this.props.currentTtsModelSelected}
                setCurrentTtsModelSelected={this.props.setCurrentTtsModelSelected}
              />
            </Route>

          </Switch>

          <NewFooterNavFc
            sessionWrapper={this.props.sessionWrapper}
            />

        </div>
      </div>
    )
  }
}

export { NewVocodesContainer }
